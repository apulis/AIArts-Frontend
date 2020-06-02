import Code from './components/Code'
import Dataset from './components/Dataset'
import Logs from './components/Logs'
import ModelFiles from './components/ModelFiles'

export const tabs = [
  { id: 'code', title: 'Code', children: props => <Code {...props} /> },
  { id: 'dataset', title: 'Datasets', children: props => <Dataset {...props} /> },
  { id: 'model-files', title: 'ModelFiles', children: props => <ModelFiles {...props} /> },
  { id: 'logs', title: 'Logs', children: props => <Logs {...props} /> }
]
