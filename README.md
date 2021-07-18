**chiner,发音:[kaɪˈnər]**

**[CHINER元数建模-3.0]**，历时三年，几经磨难，匠心打造，浴火重生。做一款丰富数据库生态的，独立于具体数据库之外的，数据库关系模型设计平台。
> 元数建模平台，使用React+Electron+Java技术体系构建。

# 1. 前世今生
1. 2018年初，我和几个对开源有兴趣的社区好友，创立了一个松散的组织，用一个半月时时间完成了PDMan的1.0版本发布，解决了从无到有的问题。
2. 2018年5月，推出了PDMan第一个开源公开版，中间持续阶段性更新，直到2019年1月，不再更新。
3. 当前每一天，有3000家以上的公司或者独立的个人在使用PDMan在设计他们的数据库。
4. 我们自己使用以及用户使用的过程中，提出了很多优化建议方案。
5. 因前期设计考虑不充分，很多优化升级执行起来非常困难，我们于2019年12月，规划了另一个全新的版本。
6. 当情怀遇上生存发展，饿着肚讲理想，真的很难。期间，我们团队几经折腾周转，数次濒临解散。
7. 2019年底，我们不到三万块启动资金，几乎是光着屁股创业，幸得有多个好友关照，给了两个项目做，核心团队分为两部分，一部分去杭州，另一部分在远走塞北，我们的吃饭问题暂时解决了。
8. 在此期间，持续发酵沉淀，我们同社区好友，利用业余时间，完成了技术架构设计，界面原型设计，关键核心模块的开发编码。
9. 我们以及社区好友，持续投入，直到到今天（2021年7月17日），终于推出全新的3.0版本。

# 2. 名称由来
1. 第一个（公开发行名称）：**PDMan**: Physical Data Model Manager(物理模型管理)
2. 第二个（内部使用名称）：**SINOPER**: SINO Popular Entity Relation(中国最流行的实体关系图工具)，目前该软件发行版，底层很多代码为该词前缀。
3. 第三个（公开发行名称）：**CHINER**: CHINESE Entity Relation(国产实体关系图工具)，为方便国内普及，中文名称为：**元数建模**，也作:"**CHINER[元数建模]**"公开使用。

# 3. 本版本(CHINER[元数建模]v3.0)的要点说明
1. 基于前面3年的经验积累，为解决基因缺陷，重新出发，另外重新做。
2. 体系结构重新设计，结构颠覆，但是对原PDMan做到高度兼容。
3. 还是原来的配方，原来的味道，保持原来的操作习惯，并局部优化提升。
4. 精细的界面布局及操作优化，更好看，更简单，更好用。
5. 增加实用新功能(如导入PowerDesigner等），功能更强大，生态兼容性更好。
6. 删除了一些非关键的使用风险较高、做得不好、比较鸡肋的功能。
7. 这回我们自己掏钱请了专业UI设计界面。

**预览截图**

![](https://oscimg.oschina.net/oscnet/up-bc56b79e974c8b78be260828f5a49553b89.png)

# 4. 功能介绍
## 4.1 自带入门参考案例
首页自带两个典型参考案例，方便用户快速了解软件支持的功能以及特性。

![](https://oscimg.oschina.net/oscnet/up-377d57036183af7a71f6c0ba93268e304a4.png)

## 4.2 管理对象
### 4.2.1 数据表及字段
提供简洁直观的数据表以及字段管理及操作，左侧列表支持拖动排序，数据表更多设置支持增加表备注，扩展属性列表，例如提供对Hive的支持，如下图：

![](https://oscimg.oschina.net/oscnet/up-8eef0b0fe2dfcfc98a1e56bc3ff89434467.png)

### 4.2.2 多表关联的视图
视图由多个表结合而成，支持多表以及字段的选择，如下图：

![](https://oscimg.oschina.net/oscnet/up-e0f217c8a895ebb62d5cffad1a06f49c7f8.png)

视图及来源数据表，如下图：

![](https://oscimg.oschina.net/oscnet/up-a008db1dda595b6f1d12136439b844a1cfd.png)

### 4.2.3 可定制的数据类型及数据域
可扩展的数据类型，并且支持多种数据库方言的适配，如下图：

![](https://oscimg.oschina.net/oscnet/up-efcef217c14b5d3a479606c6cb97dc21e79.png)

数据域，用于设置同一类具有特定业务含义的数据类型，如下图：

![](https://oscimg.oschina.net/oscnet/up-caf42f4c46226bbf2111ab19766e44a7f35.png)
![](https://oscimg.oschina.net/oscnet/up-d7c82607c6fe53eae01ab3f97984f52f60e.png)
### 4.2.4 数据标准（字段库）
标准字段库用于解决常用字段记录，方便用户建立数据表时，能够从常用字段库里直接拖入数据表中。
标准字段库可以用户自行添加，也可以从现有数据表中移到标准字段库中，如下图所示：

![](https://oscimg.oschina.net/oscnet/up-2a410362c479627576f840825e0b27e4d30.png)
![](https://oscimg.oschina.net/oscnet/up-9386768a01a28254415ee7ce1995a0e17c9.png)

标准字段库支持导出JSON文件，也支持从JSON文件中导入，以解决共享交流问题。
### 4.2.5 数据字典（代码映射表）
增加了数据字典支持，用于解决对字段元数据更清晰的解析阐述，如下图：

![](https://oscimg.oschina.net/oscnet/up-41a9f54625194c5690e04ec89c91426f88e.png)

数据表字段可以直接关联数据字典，如下图所示：

![](https://oscimg.oschina.net/oscnet/up-3668f16ef4a8fd4c012c6e1ccbab2f62048.png)

## 4.3 多模块模式以及不分模块模式
简单项目，不需要分模块，直接分为数据表，视图，关系图，数据字典即可，复杂项目需要折分为一个一个独立的模块，系统对这两种形式均给予支持。
简单模式，如下图：

![](https://oscimg.oschina.net/oscnet/up-6fe3809f46930d19eb26f81aeeb2a3d2042.png)

分模块形式，如下图：

![](https://oscimg.oschina.net/oscnet/up-4b777fb0d36dd16163b7c004ed273b73c7f.png)

## 4.4 关系图
### 4.4.1 ER关联关系图
数据实体关联关系图，该关联关系图需要人工手动维护，如下图所示：

![](https://oscimg.oschina.net/oscnet/up-50460efb7d2be4259c22c97395800e740b3.png)

### 4.4.2 简单的概念模型图
支持简单的概念模型图，概念模型图实体只保存在关系图上，不保持实体对象，如下图所示：

![](https://oscimg.oschina.net/oscnet/up-52bbc1755f4e24a126794bb7e2dd30aeab4.png)

概念模型图，主要用于快速勾勒系统的关键业务对象关系图，用于快速整体理解数据模型。
### 4.4.3 同一模块多张关系图
同一个模块，可以支持多张多种形式的关系图：

![](https://oscimg.oschina.net/oscnet/up-9f88becf7efa6aef3905ea9be7a8a123e28.png)

## 4.5 画布设计界面
### 4.5.1 分组框及以备注框
分组框，用于对数据表或者实体进行分类，能够更清晰的了解数据表的层次结构，如下图：

![](https://oscimg.oschina.net/oscnet/up-5e6ac131fdc2af2992ed3a48fdad3386b2c.png)

### 4.5.2 文字以及背景颜色设置
备注框，为普通矩形框，用于对数据表或者业务场景进行解释说明，如下图：

![](https://oscimg.oschina.net/oscnet/up-b71dccee9f4289216c4a7ec04a8053f8a6f.png)

## 4.6 代码模板
### 4.6.1 不同数据库方言的DDL
通过代码模板引擎，实现可扩展的数据库方言支持，如下图：

**MySQL：**

![](https://oscimg.oschina.net/oscnet/up-a65cb86f6b96fbb6687a8998d0d3ef7e2eb.png)

**ORACLE：**

![](https://oscimg.oschina.net/oscnet/up-ba4633664650513daf94bb3b3e536886ff7.png)

**SQLServer:**

![](https://oscimg.oschina.net/oscnet/up-7489756fcd70cfa58dbbc4be2cafb791d3a.png)

### 4.6.2 扩展属性支持类似Hive
![](https://oscimg.oschina.net/oscnet/up-ecdae24a8c050395fcf1f45285a684dd912.png)

### 4.6.3 JavaBean代码生成
![](https://oscimg.oschina.net/oscnet/up-3b091990751a4ea2992fba4ff634cfca646.png)

### 4.6.4 可定制化可编辑的代码模板引擎
代码模板引擎基于doT.js构建，如下图：

![](https://oscimg.oschina.net/oscnet/up-954259002502d8344eb02f8bb29c0d5d4de.png)

提供代码预览编辑，以便能够及时预览代码模板的效果，如下图：

![](https://oscimg.oschina.net/oscnet/up-94713c2ec42e832298f287202f14341fd8f.png)

## 4.7 生态对接-导入
### 4.7.1 数据库逆向
连接数据库，逆向解析数据库，支持数据库中文注释的解析。
连接数据库，如下图：

![](https://oscimg.oschina.net/oscnet/up-71491d4c34977ce3d346c0c8c9e7db3a765.png)

解析数据列表清单，如下图：

![](https://oscimg.oschina.net/oscnet/up-7c7f8e11a1bf441a020fc672db8b4fefac3.png)

解析数据表结果，如下图：

![](https://oscimg.oschina.net/oscnet/up-65a71a361a7736ba1eca69966e18ef5b40e.png)
### 4.7.2 导入PDMan文件
支持PDMan的导入，支持数据表，关系图，数据域的高度还原。
导入列表选择，如下图：

![](https://oscimg.oschina.net/oscnet/up-75a57b46446978aa720573b81fec227be77.png)

导入后结果，如下图：

![](https://oscimg.oschina.net/oscnet/up-a61507effd971c8c774f99da0a259619c64.png)

PDMan原始情况，如下图：

![](https://oscimg.oschina.net/oscnet/up-4ff384b4dabf15877ff50b7457b53f06487.png)
### 4.7.3 导入PowerDesigner文件
导入PowerDesigner，支持数据表，数据域的高度还原（不支持关系图还原），如下图：

![](https://oscimg.oschina.net/oscnet/up-8a10182e4059e2a6102f66a2b3cd7522ef2.png)

数据表选择，如下图：

![](https://oscimg.oschina.net/oscnet/up-dd1043e28054b37711139b679016ec77a9d.png)

最终导入后结果，如下图：

![](https://oscimg.oschina.net/oscnet/up-58c53a6e3ee6a22d429dd91a3c5fc59a328.png)

## 4.8 生态对接-导出
### 4.8.1 导出DDL
导出DDL，用于解决一次性导出指定数据表，针对指定数据库方言的导出，如下图：

![](https://oscimg.oschina.net/oscnet/up-22048d17e7b5b9b73742a382116eef0a25c.png)

### 4.8.2 导出WORD文档及模板可定制
将当前数据表，关系图，数据字典导出至WORD文档，如下图：

![](https://oscimg.oschina.net/oscnet/up-28dbbe80c7054ed5a28c05727e8a95ccec3.png)

导出结果，如下图：

![](https://oscimg.oschina.net/oscnet/up-ad6471a8fd81aa67a9552f79c33aae322cb.png)
![](https://oscimg.oschina.net/oscnet/up-d01a17aaa75ee5109e3406df9572de01a21.png)
### 4.8.3 关系图导出图片
实现将当前画布的关系图，导出为PNG图片。

## 5. 全局搜索及定位
字段及关键字，数据字典等的全局搜索，如下图：

![](https://oscimg.oschina.net/oscnet/up-9af149ef54054b35266716f55b2dbff97f3.png)

## 6. 更多特性
### 6.1 多语言
中文，如下图：

![](https://oscimg.oschina.net/oscnet/up-1a1888c779a8efcc18e36e62d10ce34762f.png)

英文，如下图：

![](https://oscimg.oschina.net/oscnet/up-93ba0908b9dd24ceeb4f16e9e703d1114ad.png)

语言设置，如下图：

![](https://oscimg.oschina.net/oscnet/up-6722ee98f359b9ce053a25907b9e52454cd.png)
### 6.2 新建表默认初始化字段
![](https://oscimg.oschina.net/oscnet/up-d87cc8da3669a23bfb7524629e77fd331b4.png)
### 6.3 表编辑一次性设置多个数据域
![](https://oscimg.oschina.net/oscnet/up-18b1f17e98a88199d473704d6d573afa867.png)

# 7. 开源协议说明
元数建模，采用[木兰公共许可证, 第2版](https://license.coscl.org.cn/MulanPubL-2.0/ "")开源协议。

# 8. 对社区用户的承诺
## 8.1 历史承诺盘点：
2018年3月，在苏州源创会，给用户承诺后续将完成以下功能：

![](https://oscimg.oschina.net/oscnet/up-84611232cb487501d86cc5bc3814b9f4aba.png)

- 1-提升用户体验
-  &nbsp;&nbsp;1-1 提升界面美观[完成]
-  &nbsp;&nbsp;1-2 优化用户操作[完成]
- 2-更多模型支持
- &nbsp;&nbsp;2-1 导入ERWin[未完成，视用户需求，再作决定]
- &nbsp;&nbsp;2-2 导入PowerDesigner[完成]
- 3-小型专业化社区[部分完成]

## 8.2 未来承诺
1. CHINER元数建模，作为一款国产免费开源数据库建模工具，源代码以及编译后的程序，都免费提供给个人或者组织使用。
2. 在此基础上二次开发，再次出售，需遵守[木兰公共许可证, 第2版](https://license.coscl.org.cn/MulanPubL-2.0/ "")。
3. 为简化用户使用，CHINER提供编译后的安装包。
4. 后续我们将会根据用户的使用情况，对国产操作系统及平台作适配。

# 9. 产品线（规划中）
为更好鼓励开源，激励开源贡献者的热情，生态良性发展，后续我们将尝试推出以下两个商业版：
- **云服务Web在线版**: 除保留原来的所有功能外，增加团队协作，版本管理，行业词库，智能纠正，WebHooks等团队及企业级应用功能。
- **企业私有部署Web版**：功能与Web在线版相同，提供企业私有化部署，满足企业数据代码资产要求内网部署的要求。

# 10. 下载及交流
## 10.1 源代码地址
前端JS：    [查看](https://gitee.com/robergroup/chiner.git "查看")
&nbsp;| &nbsp;后端Java：[查看](https://gitee.com/robergroup/chiner-java.git "查看")

## 10.2 下载及交流
同发知乎: [知乎](https://zhuanlan.zhihu.com/p/390858721)

安装文件下载及交流 [前往下载以及交流](https://gitee.com/robergroup/chiner/releases "前往下载以及交流地址")
