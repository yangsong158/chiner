import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDom from 'react-dom';

import SearchInput from '../searchinput';
import FormatMessage from '../formatmessage';
import Button from '../button';
import { openModal } from '../modal';
import {getPrefix} from '../../lib/prefixUtil';
import {addBodyClick, removeBodyClick} from '../../lib/listener';
import './style/index.less';
import MoreList from './MoreList';

export default React.memo(({placeholder, prefix, dataSource,
                             jumpPosition, jumpDetail}) => {
  const currentPrefix = getPrefix(prefix);
  const listRef = useRef(null);
  const modalRef = useRef(null);
  const id = useMemo(() => Math.uuid(), []);
  const suggestRef = useRef(null);
  const searchRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const onChange = (e) => {
    setSearchValue(e.target.value);
  };
  useEffect(() => {
    addBodyClick(id, (e) => {
      if (!searchRef?.current?.contains(e.target) && !listRef?.current?.contains(e.target)) {
        setSearchValue('');
      }
    });
    return () => {
      removeBodyClick(id);
    };
  }, []);
  const allData = useMemo(() => {
    const getGroup = (type, d) => {
      return (dataSource.viewGroups || [])
          .filter(g => (g[type] || []).includes(d.defKey))
          .map(g => g.defName || g.defKey || '');
    };
    const entityData = (dataSource.entities || [])
        .map(e => ({...e, type: 'refEntities'}))
        .concat((dataSource.views || []).map(v => ({...v, type: 'refViews'})))
        .map((b) => {
          return {
            ...b,
            groups: getGroup(b.type, b),
          };
        });
    const dictData = (dataSource.dicts || []).map((d) => {
      const groups = getGroup('refDicts', d);
      return {
        ...d,
        type: 'refDicts',
        groups,
      };
    });
    return [
      {
        key: 'entities',
        data: entityData.map((e) => {
          const groups = e.groups.join('|');
          return {
            ...e,
            suggest: `${e.defKey}-${e.defName}${groups ? `@${groups}` : ''}`,
          };
        }),
      },
      {
        key: 'fields',
        data: entityData.reduce((a, b) => {
          return a.concat(b.fields.map((f) => {
            // 模块名（没有则省略）/表(视图）代码[表显示名] /字段代码[字段显示名]
            const groups = b.groups.join('|');
            return {
              ...f,
              type: b.type,
              groups: b.groups,
              entity: b.defKey,
              suggest: `${f.defKey}-${f.defName}@${b.defKey}-${b.defName}${groups ? `@${groups}` : ''}`,
            };
          }));
        }, []),
      },
      {
        key: 'dicts',
        data: dictData.map((d) => {
          const groups = d.groups.join('|');
          return {
            ...d,
            suggest: `${d.defKey}-${d.defName}${groups ? `@${groups}` : ''}`,
          };
        }),
      },
      {
        key: 'dictItems',
        data: dictData.reduce((a, b) => {
          return a.concat(b.items.map((i) => {
            const groups = b.groups.join('|');
            return {
              ...i,
              type: b.type,
              groups: b.groups,
              dict: b.defKey,
              suggest: `${i.defKey}-${i.defName}@${b.defKey}-${b.defName}${groups ? `@${groups}` : ''}`,
            };
          }));
        }, []),
      },
      {
        key: 'standardFields',
        data: (dataSource.standardFields || []).reduce((a, b) => {
          return a.concat(b.fields.map((f) => {
            return {
              ...f,
              groups: [b.defKey],
              suggest: `${f.defKey}-${f.defName}@${b.defKey}-${b.defName}`,
            };
          }));
        }, []),
      },
    ];
  }, [dataSource]);
  const calcSuggest = (suggest, search) => {
    const suggestArray = suggest.split('');
    const startIndex = suggest.toLocaleUpperCase().indexOf(search.toLocaleUpperCase());
    const endIndex = startIndex + search.length;
    const starStr = suggestArray.slice(0, startIndex).join('');
    const endStr = suggestArray.slice(endIndex, suggestArray.length).join('');
    return <>{starStr}<span
      className={`${currentPrefix}-search-suggest-list-search`}
    >{suggest.slice(startIndex, endIndex)}</span>{endStr}</>;
  };
  const _jumpPosition = (...args) => {
    setSearchValue('');
    modalRef.current?.close();
    jumpPosition && jumpPosition(...args);
  };
  const _jumpDetail = (...args) => {
    setSearchValue('');
    modalRef.current?.close();
    jumpDetail && jumpDetail(...args);
  };
  const getOpt = (d, key) => {
    let opt = '';
    switch (key){
      case 'entities':
        opt = <>[<a
          onClick={() => _jumpPosition(d, key)}
        ><FormatMessage id='components.searchSuggest.position'/></a>|<a
          onClick={() => _jumpDetail(d, key)}
        ><FormatMessage id='components.searchSuggest.detail'/></a>]</>;
        break;
      case 'fields': opt = <>[<a
        onClick={() => _jumpDetail(d, key)}
      ><FormatMessage id='components.searchSuggest.detail'/></a>]</>;
        break;
      case 'dicts': opt = <>[<a
        onClick={() => _jumpPosition(d, key)}
      ><FormatMessage id='components.searchSuggest.position'/></a>|<a
        onClick={() => _jumpDetail(d, key)}
      ><FormatMessage id='components.searchSuggest.detail'/></a>]</>;
        break;
      case 'dictItems': opt = <>[<a
        onClick={() => _jumpDetail(d, key)}
      ><FormatMessage id='components.searchSuggest.detail'/></a>]</>;
        break;
      case 'standardFields': opt = <>[<a
        onClick={() => _jumpDetail(d, key)}
      ><FormatMessage id='components.searchSuggest.detail'/></a>]</>;
        break;
      default: break;
    }
    return opt;
  };
  const getItemList = (data, aData, search) => {
    return data.filter(d => d.data.length > 0).map((d) => {
      return <div key={d.key} className={`${currentPrefix}-search-suggest-list-group`}>
        <span>
          <FormatMessage id={`components.searchSuggest.${d.key}`}/>
          (<FormatMessage
            id='components.searchSuggest.length'
            data={{count: aData.filter(ad => ad.key === d.key)[0]?.data?.length}}
        />)
        </span>
        <div className={`${currentPrefix}-search-suggest-list-children`}>
          {d.data.map((c) => {
            return <div key={c.suggest} className={`${currentPrefix}-search-suggest-list-item`}>
              <span>{calcSuggest(c.suggest, search)}</span>
              <span>{getOpt(c, d.key)}</span>
            </div>;
          })}
        </div>
      </div>;
    });
  };
  const getFilterData = (data = [], value) => {
    return data
        .filter((d) => {
          return ((d.defKey || '').toLocaleUpperCase().includes(value.toLocaleUpperCase())
              || (d.defName || '').toLocaleUpperCase().includes(value.toLocaleUpperCase()));
        });
  };
  const moreClick = (filterData) => {
    const onOK = () => {
      modalRef.current && modalRef.current.close();
      modalRef.current = null;
    };
    modalRef.current = openModal(<MoreList
      allData={allData}
      filterData={filterData}
      getItemList={getItemList}
      currentPrefix={currentPrefix}
      getFilterData={getFilterData}
      placeholder={placeholder}
      search={searchValue}
    />, {
      title: <FormatMessage id='components.searchSuggest.moreList'/>,
      buttons: [
        <Button key='onOK' onClick={onOK}>
          <FormatMessage id='button.close'/>
        </Button>],
    });
  };
  const childrenMemo = useMemo(() => {
    if (searchValue) {
      // 数据表 视图 数据字典 字段库
      const suggestRect = suggestRef.current.getBoundingClientRect();
      const filterData = allData.map((d) => {
        return {
          ...d,
          data: getFilterData(d.data, searchValue),
        };
      }).filter(d => d.data.length > 0);
      const simpleFilterData = filterData.map(d => ({
        ...d,
        data: d.data.slice(0, 4),
      }));
      const moreFilterData = filterData.map(d => ({
        ...d,
        data: d.data.slice(4, d.data.length),
      }));
      return <div
        className={`${currentPrefix}-search-suggest-list`}
        ref={listRef}
        style={{
            maxHeight: window.innerHeight - suggestRect.bottom - 2,
            right: 5,
            top: suggestRect.bottom + 2,
            width: suggestRect.width * 2,
          }}
      >
        {
          simpleFilterData.length > 0 ? <>{getItemList(simpleFilterData, filterData, searchValue)}{
            moreFilterData.some(d => d.data.length > 0) ?
              <div
                className={`${currentPrefix}-search-suggest-more`}
                onClick={() => moreClick(filterData)}
              >
                <FormatMessage id='components.searchSuggest.more'/>
              </div> : ''
          }</> : <div className={`${currentPrefix}-search-suggest-empty`}>
            <FormatMessage id='components.searchSuggest.empty'/>
          </div>
        }
      </div>;
    }
    return '';
  }, [searchValue, dataSource]);
  return <div className={`${currentPrefix}-search-suggest`} ref={suggestRef}>
    <SearchInput ref={searchRef} value={searchValue} placeholder={placeholder} onChange={onChange}/>
    {
      ReactDom.createPortal(childrenMemo, document.body)
    }
  </div>;
});
