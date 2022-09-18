import axios from 'axios';

export const getProductTags = async () => {
  try {
    const response = await axios.post(
      'https://training-duc-nv.myshopify.com/admin/api/2022-07/graphql.json',
      {
        query: `{
        shop {
            productTags(first: 10) {
             edges {
            node
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

    const data = response.data.data.shop.productTags.edges.map((e) => {
      return e.node;
    });

    return data;
  } catch (error) {
    console(error);
  }
};
