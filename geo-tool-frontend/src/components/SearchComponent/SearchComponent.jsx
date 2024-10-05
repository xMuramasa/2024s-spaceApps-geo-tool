import React, { useState, useEffect, useMemo } from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Row from 'react-bootstrap/Row';

import { DashCircleFill, SortAlphaDown, SortAlphaUpAlt, X, XCircleFill } from 'react-bootstrap-icons';
import { normalizeString } from '../../../src/utils';

import './SearchComponent.scss';

const { Control } = Form;

export default function SearchComponent({
  nameLabel, idLabel, options, rootSelectedIds, handleRootSelection
}) {

  const selectedIds = useMemo(() => rootSelectedIds);

  const [renderOptions, setRenderOptions] = useState(null);

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (options && options.length > 0) {
      setRenderOptions(options);
    }
  }, [options]);

  const filterOptions = (search) => {
    const normalizedSearch = normalizeString(search);

    const filtered = options.filter((option) => {
      const normalizedName = option ? normalizeString(option[nameLabel]) : '';
      return normalizedName.includes(normalizedSearch);
    });

    if (search === '') {
      setRenderOptions(options);
    } else {
      setRenderOptions(filtered);
    }
  }

  const handleTextChange = (searchString) => {
    setSearchText(searchString);
    setTimeout(() => {
      filterOptions(searchString);
    }, 200);
  }

  const clearInput = () => {
    setSearchText('');
    filterOptions('');
  }

  return (
    <div className={'search-component shadow'}>

      <div className={`search-component-header`}>
        <OverlayTrigger
          placement={'bottom'}
          rootClose={true}
          rootCloseEvent='click'
          overlay={options.length > 0 ?
            <Popover id='search-results' className='py-2 shadow group-popover'>
              <RenderResults
                nameLabel={nameLabel}
                idLabel={idLabel}
                options={options}
                renderOptions={renderOptions}
                selectedIds={selectedIds}
                handleSelect={id => handleRootSelection(id)}
              />
            </Popover>
            :
            <></>
          }
          trigger={"click"}
        >
          {({ ...triggerHandler }) => (
            <div className={`item1`}>
              <InputGroup >
                <Control
                  id={`geo-tool-input-search`}
                  placeholder={'🔎 Busar'}
                  type="text"
                  {...triggerHandler}
                  value={searchText}
                  onChange={(e) => handleTextChange(e.target.value)}
                />
                {searchText && (
                  <Button variant="outline-primary" onClick={clearInput} size='sm'
                    style={{
                      backgroundColor: '#fff',
                      border: 'none',
                      padding: '0px',
                      margin: '0px',
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}
                  >
                    <InputGroup.Text
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} >
                      <X size={25} />
                    </InputGroup.Text>
                  </Button>
                )}

              </InputGroup>

            </div>
          )}
        </OverlayTrigger>
      </div>
      {
        selectedIds.length > 0 ?
          <RenderRecommendation
            options={options}
            selectedIds={selectedIds}
            handleClick={(id) => handleRootSelection(id)}
            idLabel={idLabel}
            nameLabel={nameLabel}
          />
          : null
      }
    </div>
  )
}

const RenderResults = (
  { nameLabel, idLabel, renderOptions, handleSelect, selectedIds }
) => {

  const [sortValue, setSortValue] = useState(null);

  const optionsState = useMemo(() => {
    let sorted = renderOptions ?? [];
    if (sorted) {
      if (sortValue === null) {
        return sorted?.sort((a, b) => b.stars - a.stars);
      };

      if (sortValue) {
        sorted = sorted?.sort((a, b) => a.name < b.name ? 1 : -1);
      } else {
        sorted = sorted?.sort((a, b) => a.name > b.name ? 1 : -1);
      }
    }
    return sorted;
  }, [renderOptions, sortValue]);

  return (
    <div className='p-2'>
      <div className='p-1 m-1 search-filters' >
        <div className='ms-auto'>
          {!sortValue ?
            <Button variant='outline-primary' className='mx-1' onClick={() => setSortValue(true)} >
              <SortAlphaDown size={20} />
            </Button>
            :
            <Button variant='outline-primary' className='mx-1' onClick={() => setSortValue(false)} >
              <SortAlphaUpAlt size={20} />
            </Button>
          }
          {sortValue !== null ?
            <XCircleFill size={20} onClick={() => setSortValue(null)} color='#6628ff' />
            : null
          }
        </div>
      </div>
      {optionsState && optionsState.length > 0 ?
        optionsState.map((item, ix) => (
          <Row key={ix}
            className='align-items-center outline point p-1 m-1'
            onClick={() => handleSelect(item[idLabel])} >
            <Col xs={2} className='m-0 px-2'>
              <Form.Check
                required={false}
                name={item[nameLabel]}
                type={'checkbox'}
                id={item[idLabel]}
                onChange={() => { }}
                {
                ...{ checked: selectedIds.includes(item[idLabel]), }
                }
              />
            </Col>
            <Col xs={9}> {item[nameLabel]} </Col>
          </Row>
        ))
        :
        <Row> No se encontraron resultados similares </Row>
      }
    </div>
  )
}


export const RenderRecommendation = ({ idLabel, nameLabel, selectedIds, options, handleClick }) => {
  return (
    <div className="search-component-body" >
      {selectedIds.map((selected, index) => {
        let option = options.find(option => option[idLabel] === selected[idLabel]);
        const optionName = option ? option[nameLabel] : null;
        if (optionName) {
          return (
            <div className="selected-item outline" key={`${optionName}-${index}`}>
              <Col xs className="text-capitalize" style={{ textAlign: 'left' }}>
                {optionName}
              </Col>
              <div className="justify-content-end align-items-center">
                <XCircleFill className="stars point" size={20} onClick={() => handleClick(option[idLabel])} />
              </div>
            </div>
          )
        }
        return null;
      })}
    </div>
  )
}