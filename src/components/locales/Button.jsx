import React from 'react';
import { Button } from 'antd';
import capFirstLetter from '../../src/utils/capFirstLetter';

const UpperCaseButton = (prop) => {
  return (
    <Button {...props}>{capFirstLetter(props.children)}</Button>
  )
};


export default UpperCaseButton; 