export const customProductAll = (response) => {
  const data = response.products.edges.map((e) => {
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

  return data;
};
