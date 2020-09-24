## 平台调策略的方案完善文档 20200820：

1. 资源采集方面，改进为采集每个 node 的 capacity（总设备数量）和 allocatable（当前可用数量），存入 mysql，然后提供接口给前端请求，这样前端就知道每个 node 的具体设备数量情况

示例数据：

```
        {
"huawei_npu_arm64": {"capacity":16,"detail":[{"allocatable":6,"capacity":8,"nodeName":"atlas02"},{"allocatable":3,"capacity":8,"nodeName":"atlas01"}],"deviceStr":"npu.huawei.com/NPU"},
"nvidia_gpu_amd64_GTX2080TI": {"capacity":8,"detail":[{"allocatable":5,"capacity":8,"nodeName":"atlas-gpu02"},{"allocatable":3,"capacity":7,"nodeName":"atlas-gpu01"}],"deviceStr":"nvidia.com/gpu"}
}
```

2. 前端方面，对于 GPU a) 提交 regular Job 时，拿到全部节点中的最高 capacity 值，用于限制用户可以选择设备 num 的最大值；拿到所有节点的最高 allocatable 值，用于提示用户填写了超出 allocatable 的设备 num 时，Job 将会处于排队。对于示例数据，最高 capacity 值为 8，最高 allocatable 值为 5

b) 提交 distribute Job 时， i. 可以手动输入 node 数量（num of node），node 数量 n 最高限制为节点的数量和。对于示例数据，node 数量 n 为 2。

ii. 选择每个 node 的设备数量（num of per device）。假定选择了 node 数量为 n，那么每个 node 的设备数量 m 可选择项为 1，2，4…2^N，其中 N 值满足表达式 2^N<=所有节点的前 n 大 capacity 值。对于示例数据，假定 node 数量 n=1，那么每个 node 的设备数量 m 值可选为 1、2、4、8。 node 数量 n=2，那么每个 node 的设备数量 m 值可选为 1、2、4。

iii. 提交时，针对用户填的 node 数量 n 和每个 node 的设备数量 m，当不满足条件：m>所有节点的前 n 大 allocatable 值时，提示用户本次提交的 job 将进入排队状态。对于示例数据，当 node 数量 n=1 时，那么每个 node 的设备数量 m>5 时，需要提示。当 node 数量 n=2 时，那么每个 node 的设备数量 m>3 时，需要提示。

NPU 的 regular Job 类型，设备 num 限制还是 0，1，2，4，8。 NPU 的 distribute Job 类型，每个 node 的设备数量（num of per device）还是默认 8 卡。Node 数量最高要限制为节点的总和。
