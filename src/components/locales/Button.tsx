import React from 'react';
import { Button } from 'antd';
import { capFirstLetter } from '@/utils/utils';
import { ButtonProps } from 'antd/lib/button';

interface IUpperCaseButtonProps extends ButtonProps {
  disableUpperCase?: boolean;
}

const UpperCaseButton: React.FC<IUpperCaseButtonProps> = (props) => {
  if (props.disableUpperCase === true) {
    return <Button {...props}>{props.children}</Button>;
  }
  if (typeof props.children === 'string') {
    return <Button {...props}>{capFirstLetter(props.children)}</Button>;
  }
  return <Button {...props}>{props.children}</Button>;
};

export default UpperCaseButton;
