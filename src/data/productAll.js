import axios from 'axios';
import { useQuery, gql } from '@apollo/client';

const getAll = gql`
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

export const getProductAll = async () => {
  try {
    const { response, loading } = useQuery(getAll);
    //filter data to Array

    const data = response.data.data.products.edges.map((e) => {
      const id = e.node.id;
      const title = e.node.title;
      const isUrl = e.node.images.edges.length > 0;
      const images = isUrl ? e.node.images.edges[0].node.url : '';
      const amountVariant = e.node.variants.edges.length;
      const variant1 = e.node.variants.edges[0].node;
      const variant2 = e.node.variants.edges[amountVariant - 1].node;
      if (amountVariant == 1) {
        return {
          id,
          title,
          images,
          variants: [variant1],
        };
      } else if (variant1.price !== variant2.price) {
        return {
          id,
          title,
          images,
          variants: [variant1, variant2],
        };
      } else {
        return {
          id,
          title,
          images,
          variants: [variant1],
        };
      }
    });
    console.log('data', data);

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductByTags = async (tags) => {
  let lstQuery = '';
  tags.forEach((e, index) => {
    if (index == 0) {
      lstQuery += `(tag:'${e}') `;
    } else {
      lstQuery += `OR (tag:'${e}')`;
    }
  });
  try {
    const response = await axios.post(
      'https://training-duc-nv.myshopify.com/admin/api/2022-07/graphql.json',
      {
        query: `{
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
      }`,
        variables: {},
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': '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',
        },
      }
    );

    //filter data to Array

    const data = response.data.data.products.edges.map((e) => {
      const id = e.node.id;
      const title = e.node.title;
      const amountVariant = e.node.variants.edges.length;
      const variant1 = e.node.variants.edges[0].node;
      const variant2 = e.node.variants.edges[amountVariant - 1].node;
      if (amountVariant == 1) {
        return {
          id,
          title,
          variants: [variant1],
        };
      } else if (variant1.price !== variant2.price) {
        return {
          id,
          title,
          variants: [variant1, variant2],
        };
      } else {
        return {
          id,
          title,
          variants: [variant1],
        };
      }
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductByCollections = async (arrId) => {
  // call list products of collections
  let lstArraydata = await Promise.all(
    arrId.map((id) => {
      return axios.post(
        'https://training-duc-nv.myshopify.com/admin/api/2022-07/graphql.json',
        {
          query: `{
            collection(id:"${id}") {
               products(first:10) {
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
        }`,
          variables: {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': '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',
          },
        }
      );
    })
  );

  // filter data
  let data = [];
  lstArraydata.forEach((e) => {
    // replace data to Array
    let dataAfterReplace = e.data.data.collection.products.edges.map((e) => {
      const id = e.node.id;
      const title = e.node.title;
      const amountVariant = e.node.variants.edges.length;
      const variant1 = e.node.variants.edges[0].node;
      const variant2 = e.node.variants.edges[amountVariant - 1].node;
      if (amountVariant == 1) {
        return {
          id,
          title,
          variants: [variant1],
        };
      } else if (variant1.price !== variant2.price) {
        return {
          id,
          title,
          variants: [variant1, variant2],
        };
      } else {
        return {
          id,
          title,
          variants: [variant1],
        };
      }
    });

    data.push(dataAfterReplace);
  });

  // flat array
  const products = data.flat();

  return products;
};
