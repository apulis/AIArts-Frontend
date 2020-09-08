## 平台调策略的方案完善文档20200820：

1.	资源采集方面，
改进为采集每个node的capacity（总设备数量）和allocatable（当前可用数量），存入mysql，然后提供接口给前端请求，这样前端就知道每个node的具体设备数量情况

示例数据：
```
        {
"huawei_npu_arm64": {"capacity":16,"detail":[{"allocatable":6,"capacity":8,"nodeName":"atlas02"},{"allocatable":3,"capacity":8,"nodeName":"atlas01"}],"deviceStr":"npu.huawei.com/NPU"},
"nvidia_gpu_amd64_GTX2080TI": {"capacity":8,"detail":[{"allocatable":5,"capacity":8,"nodeName":"atlas-gpu02"},{"allocatable":3,"capacity":7,"nodeName":"atlas-gpu01"}],"deviceStr":"nvidia.com/gpu"}
}
```

2.	前端方面，对于GPU
a)	提交regular Job时，拿到全部节点中的最高capacity值，用于限制用户可以选择设备num的最大值；拿到所有节点的最高allocatable值，用于提示用户填写了超出allocatable的设备num时，Job将会处于排队。
对于示例数据，最高capacity值为8，最高allocatable值为5

b)	提交distribute Job时，
i.	可以手动输入node数量（num of node），node数量n最高限制为节点的数量和。
对于示例数据，node数量n为2。

ii.	选择每个node的设备数量（num of per device）。假定选择了node数量为n，那么每个node的设备数量m可选择项为1，2，4…2^N，其中N值满足表达式2^N<=所有节点的前n大capacity值。
对于示例数据，假定node数量n=1，那么每个node的设备数量m值可选为1、2、4、8。
node数量n=2，那么每个node的设备数量m值可选为1、2、4。

iii.	提交时，针对用户填的node数量n和每个node的设备数量m，当不满足条件：m>所有节点的前n大allocatable值时，提示用户本次提交的job将进入排队状态。
对于示例数据，当node数量n=1时，那么每个node的设备数量m>5时，需要提示。
当node数量n=2时，那么每个node的设备数量m>3时，需要提示。

NPU的regular Job类型，设备num限制还是0，1，2，4，8。
NPU的distribute Job类型，每个node的设备数量（num of per device）还是默认8卡。Node数量最高要限制为节点的总和。