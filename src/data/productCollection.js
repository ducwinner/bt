import axios from 'axios';

export const getCollections = async () => {
  try {
    const response = await axios.post(
      'https://training-duc-nv.myshopify.com/admin/api/2022-07/graphql.json',
      {
        query: `{
          shop {
              collections(first: 5) {
            edges {
              node {
                id
                title
                image {
                  url
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
    const data = response.data.data.shop.collections.edges.map((e) => {
      const id = e.node.id;
      const title = e.node.title;

      if (e.node.images) {
        return {
          id,
          title,
          images: e.node.images.edges[0].node.url,
        };
      } else {
        return {
          id,
          title,
          images: '',
        };
      }
    });

    return data;
  } catch (error) {
    console(error);
  }
};
