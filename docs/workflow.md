# AI项目开发流程表

串联流程的主Agent是PM

|   流程代号   |   子流程   |    流程名    |                           流程说明                           | Agent |        Skill        |      Command       |
| :----------: | :----------: | :----------: | :----------------------------------------------------------: | :---: | :-----------------: | :----------------: |
|impm-project||项目文档|生成项目文档，包括项目基本信息，编码规范，当前进展和项目地图|SA|impm-create-project|impm-create-project
|impm-req||生成需求文档|根据提示和提示语包含的需求文件信息，生成对应的需求文件，并生成当前需求的版本号|BA|impm-req-create|impm-req-create
|impm-branch||git新分支|每轮开发都用新的分支。分支名为当前需求的版本号|VCA| impm-create-barnch | impm-create-barnch 
|impm-prd||生成prd文档|根据当前版本号，查询req和project文件，根据这两个和prd模版文件，生成对应版本的prd文件|BA|impm-create-prd|impm-create-prd
|impm-architect||生成Architect文档|根据当前版本号，查询prd和project文件，根据这两个和architect模版文件，生成对应版本的architect文件|SA|impm-create-architect|impm-create-architect
|impm-spec||生成spec文档|根据当前版本号，查询prd,architect和project文件，根据这三个文件和spec模版文件，生成对应版本的spec文件|TL|impm-create-spec|impm-create-spec
|impm-task||生成task文档|根据当前版本号，查询prd,spec,architect和project文件，根据这四个文件和task模版文件，生成对应版本的task的md文件和json文件|TL|impm-create-task|impm-create-task
|impm-coding||代码编写|根据当前版本号，获取task的json，循环任务，启动主流程处理|PM|impm-coding|impm-coding
|impm-coding|impm-coding-context|上下文获取|根据当前版本号和task编号，查询对应的task，prd的相关部分内容。spec的内容以及全局的project和architect的内容，作为编码需求部分的上下文。|TL|impm-coding-context|
|impm-coding|impm-coding-cs|相关代码查询|查询和当前task相关的，项目现有代码情况，以及工具类的情况|CS|impm-coding-cs|
|impm-coding|impm-coding-ws|网络文档查询|在线查询和当前task相关的，项目需要使用的网络文档|WS|impm-coding-ws|
|impm-coding|impm-coding-test-case|测试用例编写|根据现有的上下文，编写测试用例文档|TE|impm-coding-test-case|
|impm-coding|impm-coding-test-code|测试代码编码|根据现有的上下文，编写测试函数|TE|impm-coding-test-code|
|impm-coding|impm-coding-code|实际编码|TL根据当前编码类型，确定是调用FE/BE/DE来完成编码|TL-FE/BE/DE|impm-coding-code|
|impm-coding|impm-coding-test|执行测试|执行测试代码，查看测试结果，如果测试失败，将失败的堆栈信息传入上下文，返回上一步重新编码。如果编码连续5次失败，报错退出。|TE|impm-coding-test|
|impm-coding|impm-coding-review|代码审核|测试通过的代码还需要进行审核，如果审核不通过，则将不通过的理由传入上下文，退回编码重新编码和测速|TL|impm-coding-review|
|impm-coding|impm-coding-review|代码审核|测试通过的代码还需要进行审核，如果审核不通过，则将不通过的理由传入上下文，退回编码重新编码和测速|TL|impm-coding-review|
|impm-coding|impm-coding-comment|添加注释|给本次修改的代码添加详细注释|TL|impm-coding-comment|
|impm-coding|impm-coding-project-update|更新project|根据本次修改的代码，更新project的项目地图模块|TL|impm-coding-project-update|
|impm-coding|impm-coding-git|提交变更|在当前分支上提交本次所有的变更，并将将当前task标注为已完成。|VCA|impm-coding-git|
|impm-test||回归测试|全量测试验证|TE|impm-test|impm-test
|impm-docs-write||项目文档生成|生成README.md，agent.md，部署文档|TW|impm-docs-write|impm-docs-write
|impm-merge-branch||当前分支合并到主分支|将当前分支合并到主分支|VCA|impm-merge-branch | impm-merge-branch


# AI项目组人员表
<!--  -->
| agent |             全称              |       中文名        | 能力 | 职责 |
| :---: | :---------------------------: | :-----------------: | :--: | :--: |
|  PM   |        Project Manager        |      项目经理       |      |      |
|  BA   |       Business Analyst        |     业务分析师      |      |      |
|  SA   |      Software Architect       |       架构师        |      |      |
|  TL   |           Tech Lead           |     技术负责人      |      |      |
|  DBA  |    Database Administrator     |    数据库管理员     |      |      |
|  WS   |         Web Searcher          |  网络技术文档查询   |      |      |
|  CS   |         Code Searcher         |   本地代码库查询    |      |      |
|  TE   |         Test Engineer         |     测试工程师      |      |      |
|  DE   |     Development Engineer      |   软件开发工程师    |      |      |
|  FE   |           Front End           | UI/UX设计和前端开发 |      |      |
|  BE   |           Back End            |      后端开发       |      |      |
|  TW   |       Technical Writer        |   技术文档编写人    |      |      |
|  VCA  | Version Control Administrator |     版本管理员      |      |      |
