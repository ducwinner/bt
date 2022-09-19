import { useState, useCallback, useMemo } from 'react';
import React from 'react';
import { Card, Avatar, ResourceList, ResourceItem, Listbox, Combobox, Icon } from '@shopify/polaris';
import { MobileCancelMajor, SearchMinor } from '@shopify/polaris-icons';
import '../../styles/components/SpecificProducts.css';
import { useDispatch, useSelector } from 'react-redux';
import { addCollection } from '../../redux/collectionSlice';
import { useEffect } from 'react';
import { getCollections } from '../../data/productCollection';
import { useQuery, gql } from '@apollo/client';
import { customCollections } from '../../function/customCollection';

function ProductCollection({ collecionAll }) {
  //Hook
  // const [selectedOptions, setSelectedOptions] = useState([]);
  const [collectionAll, setCollectionAll] = useState(collecionAll);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(collecionAll);
  //Redux
  const selectedOptions = useSelector((state) => state.collections.data);
  const dispatch = useDispatch();

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === '') {
        setOptions(collectionAll);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const resultOptions = collectionAll.filter((option) => option.title.match(filterRegex));
      setOptions(resultOptions);
    },
    [collectionAll]
  );

  const updateSelection = useCallback(
    (selected) => {
      if (selectedOptions.includes(selected)) {
        dispatch(addCollection(selectedOptions.filter((option) => option !== selected)));
      } else {
        dispatch(addCollection([...selectedOptions, selected]));
      }

      updateText('');
    },
    [options, selectedOptions, updateText]
  );

  const removeItem = useCallback(
    (id) => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(id), 1);
      dispatch(addCollection(options));
    },
    [selectedOptions]
  );

  // list collection đã select render view
  const lstCollectionSelected = useMemo(
    () => collectionAll.filter((product) => selectedOptions.includes(product.id)),
    [selectedOptions]
  );

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          const { id, title } = option;

          return (
            <Listbox.Option key={`${id}`} value={id} selected={selectedOptions.includes(id)} accessibilityLabel={title}>
              {title}
            </Listbox.Option>
          );
        })
      : null;

  return (
    <div className="specific-products">
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            prefix={<Icon source={SearchMinor} />}
            onChange={updateText}
            label="Search tags"
            labelHidden
            value={inputValue}
          />
        }
      >
        {optionsMarkup ? (
          <Listbox autoSelection="NONE" onSelect={updateSelection}>
            {optionsMarkup}
          </Listbox>
        ) : null}
      </Combobox>
      <Card>
        <ResourceList
          resourceName={{ singular: 'customer', plural: 'customers' }}
          items={lstCollectionSelected}
          renderItem={(item) => {
            const { id, title, avatarSource } = item;

            return (
              <ResourceItem
                key={id}
                id={id}
                media={<Avatar customer size="Large" name={title} source={avatarSource} shape="square" />}
                s
                accessibilityLabel={`View details for ${title}`}
                name={title}
              >
                <div className="resourceItem">
                  <div style={{ lineHeight: '60px' }}>{title}</div>
                  <div className="icon" onClick={() => removeItem(id)}>
                    <Icon source={MobileCancelMajor} color="base" />
                  </div>
                </div>
              </ResourceItem>
            );
          }}
        />
      </Card>
    </div>
  );
}

export default ProductCollection;
