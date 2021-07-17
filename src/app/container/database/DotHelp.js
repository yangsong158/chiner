import React from 'react';
import { FormatMessage } from 'components';

import {getPrefix} from '../../../lib/prefixUtil';

export default React.memo(({prefix}) => {
  const currentPrefix = getPrefix(prefix);
  return <div
    className={`${currentPrefix}-database-dothelp`}
  >
    <div><FormatMessage id='database.dot.address'/></div>
    <div>
      <div>
        <div><FormatMessage id='database.dot.learnAddress'/></div>
        <table>
          <tbody>
            <tr>
              <th><FormatMessage id='database.dot.project'/></th>
              <th><FormatMessage id='database.dot.javascript'/></th>
              <th><FormatMessage id='database.dot.grammar'/></th>
              <th><FormatMessage id='database.dot.example'/></th>
            </tr>
            <tr>
              <th><FormatMessage id='database.dot.outputVariables'/></th>
              <th>=</th>
              <th>{`{{=${FormatMessage.string({id: 'database.dot.variable'})}}`}</th>
              <th>{'{{=it.name}}'}</th>
            </tr>
            <tr>
              <th><FormatMessage id='database.dot.conditional'/></th>
              <th>if</th>
              <th>{`{{? ${FormatMessage.string({id: 'database.dot.expression'})}}}`}</th>
              <th>{'{{? i > 3}}'}</th>
            </tr>
            <tr>
              <th><FormatMessage id='database.dot.transition'/></th>
              <th>else/else if</th>
              <th>{`{{??}}/{{?? ${FormatMessage.string({id: 'database.dot.expression'})}}}`}</th>
              <th>{'{{?? i ==2}}'}</th>
            </tr>
            <tr>
              <th><FormatMessage id='database.dot.loop'/></th>
              <th>for</th>
              <th>{`{{~ ${FormatMessage.string({id: 'database.dot.loopVariable'})}}}`}</th>
              <th>{'{{~ it.arr:item}}...{{~}}'}</th>
            </tr>
            <tr>
              <th><FormatMessage id='database.dot.method'/></th>
              <th>funcName()</th>
              <th>{'{{= funcName() }}'}</th>
              <th>{'{{= it.sayHello() }}'}</th>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <span><FormatMessage id='database.dot.globalMethod'/></span>
        <table>
          <tbody>
            <tr>
              <th><FormatMessage id='database.dot.methodName'/></th>
              <th><FormatMessage id='database.dot.methodFunction'/></th>
              <th><FormatMessage id='database.dot.parameter'/></th>
              <th><FormatMessage id='database.dot.example'/></th>
            </tr>
            <tr>
              <th>camel</th>
              <th><FormatMessage id='database.dot.camel.name'/></th>
              <th><FormatMessage id='database.dot.camel.param'/></th>
              <th>{"('USER_NAME', true) => 'userName'"}</th>
            </tr>
            <tr>
              <th>underline</th>
              <th><FormatMessage id='database.dot.underline.name'/></th>
              <th><FormatMessage id='database.dot.underline.param'/></th>
              <th>{"('userName', true) => 'USER_NAME'"}</th>
            </tr>
            <tr>
              <th>upperCase</th>
              <th><FormatMessage id='database.dot.upperCase.name'/></th>
              <th><FormatMessage id='database.dot.upperCase.param'/></th>
              <th>{"('userName') => 'USERNAME'"}</th>
            </tr>
            <tr>
              <th>lowerCase</th>
              <th><FormatMessage id='database.dot.lowerCase.name'/></th>
              <th><FormatMessage id='database.dot.lowerCase.param'/></th>
              <th>{"('USERNAME') => 'useranem'"}</th>
            </tr>
            <tr>
              <th>join</th>
              <th><FormatMessage id='database.dot.join.name'/></th>
              <th><FormatMessage id='database.dot.join.param'/></th>
              <th>{"('user','name','/') => 'user/name'"}</th>
            </tr>
            <tr>
              <th>intersect</th>
              <th><FormatMessage id='database.dot.intersect.name'/></th>
              <th><FormatMessage id='database.dot.intersect.param'/></th>
              <th>{"(['1', '2'], ['1', '2', '3']) => ['1', '2']"}</th>
            </tr>
            <tr>
              <th>union</th>
              <th><FormatMessage id='database.dot.union.name'/></th>
              <th><FormatMessage id='database.dot.union.param'/></th>
              <th>{"(['1', '2'], ['1', '2', '3']) => ['1', '2', '3']"}</th>
            </tr>
            <tr>
              <th>minus</th>
              <th><FormatMessage id='database.dot.minus.name'/></th>
              <th><FormatMessage id='database.dot.minus.param'/></th>
              <th>{"(['1', '2', '3'], ['1', '2']) => ['3']"}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>;
});
