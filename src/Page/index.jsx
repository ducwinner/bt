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
import { useQuery, gql } from '@apollo/client';
import '../styles/home.css';
import { customProductAll } from '../function/customData';
import { queryCollections, queryProductAll, queryTags } from '../query';
import { customCollections } from '../function/customCollection';

export default function HomePage() {
  //hook
  const [productAll, setProductAll] = useState([]);
  const [collectionAll, setCollectionAll] = useState([]);
  const [tags, setTags] = useState([]);
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

  // call api: get all Products, Collections, Tags
  const { data: data1, loading } = useQuery(queryProductAll, {
    onCompleted(data) {
      const result = customProductAll(data);
      setProductAll(result);
    },
  });

  const { data: data2, loading: loanging2 } = useQuery(queryCollections, {
    onCompleted(data) {
      const result = customCollections(data);
      setCollectionAll(result);
    },
  });

  const { data: data3, loading: loading3 } = useQuery(queryTags, {
    onCompleted(data) {
      const result = data.shop.productTags.edges.map((e) => {
        return e.node;
      });
      setTags(result);
    },
  });

  // Validate all require
  useEffect(() => {
    if (name && priority && !priorityErr && rulePriceValue && !priceErr && selectApply && selectCustomPrice) {
      setIsOKSave(true);
    } else {
      console.log('false');
      setIsOKSave(false);
    }
  }, [name, priority, priorityErr, rulePriceValue, priceErr, selectApply, selectCustomPrice]);

  const handleNameChange = useCallback((value) => setName(value), []);

  const handleSelectChange = useCallback((value) => setSelectStatus(value), []);

  const handleSelectApplyChange = useCallback((value) => setSelectApply(value), []);

  const handleSelectCustomPrice = useCallback((value) => setSelectCustomPrice(value), []);

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
      setPriceErr(false);
      value = Math.abs(value);
    }

    if (value > 100 && selectCustomPrice == 'percent') {
      setPriceErr(true);
    } else {
      setPriceErr(false);
    }

    setRulePriceValue(value);
  }, []);

  // Call products with Rule
  const callProductsByRule = async () => {
    let productApply = [];
    if (selectApply == 'specific') {
      productApply = productsSpecific;
    } else if (selectApply == 'tags') {
      // productApply = await getProductByTags(tagsQuery);
    } else if (selectApply == 'collection') {
      const colectionsMatch = collectionAll.filter((e) => collectionsQuery.includes(e.id));
      productApply = colectionsMatch.map((e) => e.products).flat();
    } else {
      productApply = productAll;
    }
    return productApply;
  };

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
                currentPrice,
                lastPrice: currentPrice,
              };
            } else {
              return {
                title,
                currentPrice,
                lastPrice: +rulePriceValue,
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
                currentPrice,
                lastPrice: currentPrice,
              };
            } else {
              return {
                title,
                currentPrice,
                lastPrice: currentPrice - +rulePriceValue,
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
              currentPrice,
              lastPrice: price,
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

  const handleAddPricingRule = async () => {
    const data = await callProductsByRule();
    console.log(data);
    const dataAfterApplyRule = handlePriceByRule(data);

    // data Table
    let rows = [];
    dataAfterApplyRule.forEach((e, index) => {
      // limit 10 row
      let productName = '';
      if (e.variants.length == 1) {
        productName = `${e.title} ( all variant )`;
      } else {
        productName = `${e.title} ( ${e.variants[0].title} )`;
      }
      if (index < 13) {
        rows.push([productName, `${e.variants[0].currentPrice} $`, `${e.variants[0].lastPrice} $`]);
      }
    });
    setRows(rows);
  };

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
                      renderChildren: () =>
                        selectApply == 'collection' && <ProductCollection collecionAll={collectionAll} />,
                    },
                    {
                      label: 'Product tags',
                      value: 'tags',
                      renderChildren: () => selectApply == 'tags' && <ProductTags tags={tags} />,
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
                <DataTable
                  columnContentTypes={['text', 'text', 'text']}
                  headings={['Product', 'Origin Price', 'Modified Price']}
                  rows={rows}
                />
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
