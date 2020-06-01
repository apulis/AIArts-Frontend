import Code from './components/Code'
import Dataset from './components/Dataset'
import Logs from './components/Logs'
// import Model from './components/Models'

export const tabs = [
  { id: 'code', title: 'Code', children: props => <Code {...props} /> },
  { id: 'dataset', title: 'Dataset', children: props => <Dataset {...props} /> },
  // { id: 'model', title: 'Model', children: props => <Model {...props} /> },
  { id: 'logs', title: 'Logs', children: props => <Logs {...props} /> }
]
