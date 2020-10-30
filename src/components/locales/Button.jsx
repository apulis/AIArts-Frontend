import React from 'react';
import { Button } from 'antd';
import { capFirstLetter } from '@/utils/utils';

const UpperCaseButton = (props) => {
  return (
    <Button {...props}>{capFirstLetter(props.children)}</Button>
  )
};


export default UpperCaseButton; 