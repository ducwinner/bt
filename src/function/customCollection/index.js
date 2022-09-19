import { customProductAll } from '../customData';

export const customCollections = (response) => {
  const data = response.shop.collections.edges.map((e) => {
    const id = e.node.id;
    const title = e.node.title;
    const products = customProductAll(e.node);
    if (e.node.images) {
      return {
        id,
        title,
        images: e.node.images.edges[0].node.url,
        products,
      };
    } else {
      return {
        id,
        title,
        images: '',
        products,
      };
    }
  });

  return data;
};
