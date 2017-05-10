import createForm from 'react-form-validation/create-form';
import React from 'react';
import { mount } from 'enzyme';

describe('createForm', () => {
  let subject;
  let validations;
  let adapter;
  let wrappedForm;

  class Form extends React.Component {
    render() {
      return <div />;
    }
  }

  beforeEach(() => {
    subject = createForm({
      validations,
      adapter,
    })((props) => <Passthrough {...props} />)
  });

  describe('state', () => {
    it('has the right initial state', () => {
    });
  });

  describe('validations', () => {
    validations = {
    }
  });
});
