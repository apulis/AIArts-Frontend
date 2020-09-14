export default {
  namespace: 'avisualis',
  state: {
    addFormData: {},
    panelApiData: { panel: [] },
    treeData: []
  },
  reducers: {
    // 更新 state
    saveData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    
  },
};
