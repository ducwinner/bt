import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { Tag, Listbox, Combobox, Icon, TextContainer, Stack } from '@shopify/polaris';
import { SearchMinor } from '@shopify/polaris-icons';
import '../../styles/components/SpecificProducts.css';
import { useDispatch, useSelector } from 'react-redux';
import { addTags } from '../../redux/productTagSlice';
import { getProductTags } from '../../data/productTag';
import { useQuery, gql } from '@apollo/client';

function ProductTags({ tags }) {
  //Hook
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(tags);

  // Redux
  const selectedOptions = useSelector((state) => state.tags.data);
  const dispatch = useDispatch();

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === '') {
        setOptions(tags);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const resultOptions = tags.filter((option) => option.match(filterRegex));
      setOptions(resultOptions);
    },
    [tags]
  );

  const updateSelection = useCallback(
    (selected) => {
      if (selectedOptions.includes(selected)) {
        dispatch(addTags(selectedOptions.filter((option) => option !== selected)));
      } else {
        dispatch(addTags([...selectedOptions, selected]));
      }

      updateText('');
    },
    [options, selectedOptions, updateText]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      dispatch(addTags(options));
    },
    [selectedOptions]
  );

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          return (
            <Listbox.Option
              key={`${option}`}
              value={option}
              selected={selectedOptions.includes(option)}
              accessibilityLabel={option}
            >
              {option}
            </Listbox.Option>
          );
        })
      : null;

  const tagsMarkup = selectedOptions.map((option) => (
    <Tag key={`option-${option}`} onRemove={removeTag(option)}>
      {option}
    </Tag>
  ));

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
      <TextContainer>
        <Stack>{tagsMarkup}</Stack>
      </TextContainer>
    </div>
  );
}

export default ProductTags;
