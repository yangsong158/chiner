import React from 'react';
import * as _ from 'lodash/object';

import { SimpleTab, CodeHighlight, FormatMessage } from 'components';
import emptyProjectTemplate from '../../../lib/emptyProjectTemplate';

const CodeHighlightContent = ({type, templateChange}) => {
  const omitFields = ['applyFor', 'referURL', 'type'];
  const codeTemplate = _.get(emptyProjectTemplate, 'profile.codeTemplates', []).filter(t => t.applyFor === type)[0];
  const template = Object.keys(_.omit(codeTemplate, omitFields, {}));
  return <SimpleTab
    type='block'
    tabActiveChange={i => templateChange(codeTemplate[template[i]])}
    options={template
      .map((d) => {
        return {
          key: d,
          title: FormatMessage.string({id: `tableTemplate.${d}`}) || d,
          content: <CodeHighlight data={codeTemplate[d]} style={{height: 'calc(100vh - 200px)'}}/>,
        };
      })}
  />;
};

export default React.memo(({templateChange}) => {
  const dataTypeSupport = _.get(emptyProjectTemplate, 'profile.dataTypeSupports', []);
  const _templateChange = (template) => {
    templateChange && templateChange(template);
  };
  return <div style={{height: '100%', marginBottom: 5}}>
    <SimpleTab
      options={dataTypeSupport
        .map(d => ({
          key: d,
          title: d,
          content: <CodeHighlightContent
            templateChange={_templateChange}
            type={d}
          />,
        }))}
    />
  </div>;
});
