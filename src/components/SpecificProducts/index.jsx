import { useState, useCallback, useMemo } from 'react';
import React from 'react';
import { TextField, Card, Avatar, ResourceList, ResourceItem, Icon, Modal, TextContainer } from '@shopify/polaris';
import { MobileCancelMajor, SearchMinor } from '@shopify/polaris-icons';
import '../../styles/components/SpecificProducts.css';
import { getProductAll } from '../../data/productAll';
import { useDispatch, useSelector } from 'react-redux';
import { addProducts } from '../../redux/specificProductSlice';
import { useEffect } from 'react';

function SpecificProducts({ productAll }) {
  // Hook
  const [active, setActive] = useState(false);
  const [valueSearch, setValueSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [lstSearchProduct, setLstSearchProduct] = useState(productAll);

  //Redux
  const lstSelectedProducts = useSelector((state) => state.specificProduct.data);
  const dispatch = useDispatch();

  // set initialvalue SelectedItems: list đã select trước đó
  useEffect(() => {
    const selected = lstSelectedProducts.map((e) => e.id);
    setSelectedItems(selected);
  }, []);

  const onToggleModalClick = useCallback(() => {
    setActive((prev) => !prev);
  }, []);

  const handleSelect = useCallback(() => {
    onToggleModalClick();

    const lstProduts = productAll.filter((product) => selectedItems.includes(product.id));

    dispatch(addProducts(lstProduts));
  }, [selectedItems]);

  const handleSearchChange = useCallback(
    (value) => {
      setValueSearch(value);
      const lstProducts = productAll.filter((product) => product.title.toUpperCase().includes(value.toUpperCase()));

      setLstSearchProduct(lstProducts);
    },
    [productAll]
  );

  const removeItem = useCallback(
    (id) => {
      const options = [...selectedItems];
      options.splice(options.indexOf(id), 1);

      const lstProduts = productAll.filter((product) => options.includes(product.id));

      dispatch(addProducts(lstProduts));
      setSelectedItems(options);
    },
    [selectedItems]
  );

  return (
    <div className="specific-products">
      <TextField prefix={<Icon source={SearchMinor} />} onFocus={onToggleModalClick} autoComplete="off" />
      <Card>
        <ResourceList
          resourceName={{ singular: 'customer', plural: 'customers' }}
          items={lstSelectedProducts}
          renderItem={(item) => {
            const { id, title, images } = item;

            return (
              <ResourceItem
                key={id}
                id={id}
                media={<Avatar customer size="Large" name={title} source={images} shape="square" />}
                accessibilityLabel={`View details for ${title}`}
                name={title}
              >
                <div className="resourceItem">
                  <div style={{ lineHeight: '60px' }}>{title}</div>
                  <div onClick={() => removeItem(id)} className="icon">
                    <Icon source={MobileCancelMajor} color="base" />
                  </div>
                </div>
              </ResourceItem>
            );
          }}
        />
      </Card>
      <Modal
        open={active}
        onClose={onToggleModalClick}
        title="Select Specific Products"
        primaryAction={{
          content: 'Select',
          onAction: handleSelect,
        }}
      >
        <Modal.Section>
          <TextContainer>
            <TextField
              prefix={<Icon source={SearchMinor} />}
              label="Search"
              labelHidden
              value={valueSearch}
              onChange={handleSearchChange}
            />
            <Card>
              <ResourceList
                resourceName={{ singular: 'customer', plural: 'customers' }}
                items={lstSearchProduct}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                selectable
                renderItem={(item) => {
                  const { id, title, images } = item;

                  return (
                    <ResourceItem
                      key={id}
                      id={id}
                      media={<Avatar customer size="Large" name={title} source={images} shape="square" />}
                      accessibilityLabel={`View details for ${title}`}
                      name={title}
                    >
                      <div style={{ lineHeight: '60px' }}>{title}</div>
                    </ResourceItem>
                  );
                }}
              />
            </Card>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </div>
  );
}

export default SpecificProducts;
