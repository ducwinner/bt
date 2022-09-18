export const customCollections = (response) => {
  const data = response.shop.collections.edges.map((e) => {
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
};
