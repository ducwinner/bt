import {
  Card,
  Page,
  Layout,
  Heading,
  FormLayout,
  TextField,
  Form,
  Select,
  ChoiceList,
  DataTable,
  TextStyle,
} from '@shopify/polaris';
// import {getProductAll} from "../api/productALL.js"
import React from 'react';
import { useEffect } from 'react';
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ProductCollection from '../components/ProductCollection';
import ProductTags from '../components/ProductTags';
import SpecificProducts from '../components/SpecificProducts';
// import { getProductAll, getProductByCollections, getProductByTags } from '../data/productAll';
// import { getProductByRule } from '../data/productAll';
import { useQuery, gql } from '@apollo/client';
import '../styles/home.css';
import { customProductAll, customProductByTags } from '../function/customData';

const queryAll = gql`
  {
    products(first: 20) {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 2) {
            edges {
              node {
                title
                price
              }
            }
          }
        }
      }
    }
  }
`;

export default function HomePage() {
  //hook
  const [productAll, setProductALL] = useState([]);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [priorityErr, setPriorityErr] = useState(false);
  const [rulePriceValue, setRulePriceValue] = useState('');
  const [priceErr, setPriceErr] = useState(false);
  const [selectStatus, setSelectStatus] = useState('');
  const [selectApply, setSelectApply] = useState('');
  const [selectCustomPrice, setSelectCustomPrice] = useState('');
  const [isOkSave, setIsOKSave] = useState(false);
  const [rows, setRows] = useState([]);
  //redux
  const productsSpecific = useSelector((state) => state.specificProduct.data);
  const tagsQuery = useSelector((state) => state.tags.data);
  const collectionsQuery = useSelector((state) => state.collections.data);
  // call api: get all Products
  const { data, loading } = useQuery(queryAll, {
    onCompleted() {
      const productAll = customProductAll(data);
      setProductALL(productAll);
    },
  });

  // call api: get product by rule

  const getProductByTags = (tags) => {
    console.log('tags', tags);
    let lstQuery = '';
    tags.forEach((e, index) => {
      if (index == 0) {
        lstQuery += `(tag:'${e}') `;
      } else {
        lstQuery += `OR (tag:'${e}')`;
      }
    });

    const query = gql`{
        products(first: 10, query: "${lstQuery}") {
              edges {
                node {
                  id
                  title
                  variants(first:2) {
                      edges {
                        node {
                          title
                          price
                        }
                      }
                    }
                  }
            }
        }
    }`;

    const { data, loading } = useQuery(query);
    console.log(data);
    const products = customProductByTags(data);

    return data;
  };

  if (tagsQuery.length > 0) {
    let aaa = getProductByTags(tagsQuery);
    console.log('getProductByTags', aaa);
  }

  const getProductByCollection = () => {
    const query = gql`
      {
        collection(id: "gid://shopify/Product/1974208299030") {
          products(first: 10) {
            edges {
              node {
                id
                title
                variants(first: 2) {
                  edges {
                    node {
                      price
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const { data, loading } = useQuery(query);

    return data;
  };

  const abc = getProductByCollection();
  console.log('getProductByCollection', abc);
  //   const callALL = async () => {
  //    let list = await Promise.all(
  //     ['gid://shopify/Collection/70598819862','gid://shopify/Product/1974208299030'].map((id) => {
  //       return getProductByCollection(id)
  //     })
  //     )

  //     let a = ['gid://shopify/Collection/70598819862','gid://shopify/Product/1974208299030'].map((id) => {
  //       return getProductByCollection(id)
  //     })

  //     console.log(a)
  //     return list
  //   }

  //  const b = callALL();
  //   console.log(b)

  // Validate all require
  useEffect(() => {
    if (name && priority && !priorityErr && rulePriceValue && !priceErr && selectApply && selectCustomPrice) {
      setIsOKSave(true);
    } else {
      setIsOKSave(false);
    }
  }, [name, priority, priorityErr, rulePriceValue, priceErr, selectApply, selectCustomPrice]);

  const handleNameChange = useCallback((value) => setName(value), []);

  const handlePriorityChange = useCallback((value) => {
    // check integer
    const regex = /(?<=\s|^)\d+(?=\s|$)/;

    if (value < 0 || value > 99 || !regex.test(value)) {
      setPriorityErr(true);
    } else {
      setPriorityErr(false);
    }
    setPriority(value);
  }, []);

  const handlevRulePriceChange = useCallback((value) => {
    if (value < 0) {
      value = Math.abs(value);
    }

    if (value > 100) {
      setPriceErr(true);
    }
    setRulePriceValue(value);
  }, []);

  const handleSelectChange = useCallback((value) => setSelectStatus(value), []);

  const handleSelectApplyChange = useCallback((value) => setSelectApply(value), []);

  const handleSelectCustomPrice = useCallback((value) => setSelectCustomPrice(value), []);

  const callProductsByRule = useCallback(async () => {
    let productApply = [];
    if (selectApply == 'specific') {
      productApply = productsSpecific;
    } else if (selectApply == 'tags') {
      productApply = await getProductByTags(tagsQuery);
    } else if (selectApply == 'collection') {
      collectionsQuery.forEach(async (e) => {
        const data = await getProductByCollection(collectionsQuery);
      });
      productApply = getProductByCollection(collectionsQuery);
    } else {
      productApply = productAll;
    }
    return productApply;
  }, [selectApply, productsSpecific, tagsQuery, collectionsQuery, productAll]);

  const handlePriceByRule = useCallback(
    (data) => {
      const productsAfterApply = data.map((e) => {
        const titleProduct = e.title;
        // change all prices with one price
        if (selectCustomPrice == 'onePrice') {
          const variants = e.variants.map((e) => {
            const title = e.title;
            const currentPrice = +e.price;
            if (currentPrice < +rulePriceValue) {
              return {
                title,
                price: currentPrice,
              };
            } else {
              return {
                title,
                price: +rulePriceValue,
              };
            }
          });
          return {
            title: titleProduct,
            variants,
          };

          // change prices with a fixed amount
        } else if (selectCustomPrice == 'fixed') {
          const variants = e.variants.map((e) => {
            const title = e.title;
            const currentPrice = +e.price;
            if (currentPrice < +rulePriceValue) {
              return {
                title,
                price: currentPrice,
              };
            } else {
              return {
                title,
                price: currentPrice - +rulePriceValue,
              };
            }
          });
          return {
            title: titleProduct,
            variants,
          };

          // change price by percentage %
        } else {
          const variants = e.variants.map((e) => {
            const title = e.title;
            const currentPrice = +e.price;
            const price = currentPrice - (currentPrice * +rulePriceValue) / 100;
            return {
              title,
              price,
            };
          });
          return {
            title: titleProduct,
            variants,
          };
        }
      });

      return productsAfterApply;
    },
    [rulePriceValue, selectCustomPrice]
  );

  const handleAddPricingRule = useCallback(async () => {
    const data = await callProductsByRule();
    const dataAfterApplyRule = handlePriceByRule(data);

    // data Table
    let rows = [];
    dataAfterApplyRule.forEach((e, index) => {
      if (index < 10) {
        if (e.variants.length == 1) {
          rows.push([`${e.title} ( all variant )`, `${e.variants[0].price} $`]);
        } else {
          rows.push([`${e.title} ( ${e.variants[0].title})`, `${e.variants[0].price} $`]);
          rows.push([`${e.title} ( ${e.variants[1].title})`, `${e.variants[0].price} $`]);
        }
      }
    });
    setRows(rows);
  }, [selectApply, productsSpecific, tagsQuery, collectionsQuery, productAll, rulePriceValue, selectCustomPrice]);
  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <div className="header-footer">
            <button className={isOkSave ? 'button-save' : 'hide'} onClick={handleAddPricingRule}>
              Save
            </button>
          </div>
        </Layout.Section>
        <Layout.Section>
          <Layout>
            <Layout.Section>
              <Heading>NEW PRICING RULE</Heading>
              <Card sectioned title="General Information">
                <Form noValidate>
                  <FormLayout>
                    <TextField value={name} onChange={handleNameChange} label="Name" type="text" autoComplete="off" />
                    <TextField
                      value={priority}
                      onChange={handlePriorityChange}
                      label="Priority"
                      placeholder="0"
                      type="number"
                      autoComplete="off"
                      helpText={
                        priorityErr && (
                          <TextStyle variation="warning">
                            Please enter integer from 0 to 99, 0 is the hightest priority
                          </TextStyle>
                        )
                      }
                    />

                    <Select
                      label="Status"
                      options={['Enable', 'Disable']}
                      onChange={handleSelectChange}
                      value={selectStatus}
                    />
                  </FormLayout>
                </Form>
              </Card>
              <Card sectioned title="Apply to Products">
                <ChoiceList
                  choices={[
                    { label: 'All products', value: 'all' },
                    {
                      label: 'Specific product',
                      value: 'specific',
                      renderChildren: () => selectApply == 'specific' && <SpecificProducts productAll={productAll} />,
                    },
                    {
                      label: 'Product collection',
                      value: 'collection',
                      renderChildren: () => selectApply == 'collection' && <ProductCollection />,
                    },
                    {
                      label: 'Product tags',
                      value: 'tags',
                      renderChildren: () => selectApply == 'tags' && <ProductTags />,
                    },
                  ]}
                  selected={selectApply}
                  onChange={handleSelectApplyChange}
                />
              </Card>
              <Card sectioned title="Custom Price">
                <ChoiceList
                  choices={[
                    { label: 'Apply a price to selected products', value: 'onePrice' },
                    {
                      label: 'Decrease a fixed amount of the original prices of the select products',
                      value: 'fixed',
                    },
                    {
                      label: 'Decrease the original prices of the select product by percentage % ',
                      value: 'percent',
                    },
                  ]}
                  selected={selectCustomPrice}
                  onChange={handleSelectCustomPrice}
                />
                <TextField
                  suffix={selectCustomPrice == 'percent' && <div>%</div>}
                  value={rulePriceValue}
                  onChange={handlevRulePriceChange}
                  label="Amount"
                  type="number"
                  autoComplete="off"
                  prefix={!(selectCustomPrice == 'percent') && <div style={{ textDecoration: 'underline' }}>đ</div>}
                  helpText={
                    priceErr && (
                      <TextStyle variation="warning">
                        {selectCustomPrice == 'percent' && rulePriceValue > 100
                          ? 'Please enter number from 0 to 99'
                          : ''}
                      </TextStyle>
                    )
                  }
                />
              </Card>
            </Layout.Section>
            <Layout.Section secondary>
              <div className="pricing-detail">
                <div className="pricing-detail-heading">Show product pricing detail</div>
                <DataTable columnContentTypes={['text', 'text']} headings={['Title', 'Modified price']} rows={rows} />
              </div>
            </Layout.Section>
          </Layout>
        </Layout.Section>
        <Layout.Section>
          <div className="header-footer">
            <button className={isOkSave ? 'button-save' : 'hide'} onClick={handleAddPricingRule}>
              Save
            </button>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
