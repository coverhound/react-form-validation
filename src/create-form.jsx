import React, { PropTypes } from 'react';
import Fieldset from './fieldset';
import * as adapters from './adapters';
import { noop, valuesFalsy, deepEquals, curryEvent } from './utils';

/**
* createForm
* A high-order component (HOC) that wraps a form component.
* Handles validation and state management for forms
* @param {Object} params
* @param {Object.<string, validation()>} params.validations
* @param {string} params.adapter - Must be present in ./adapters
*
* @example
*
* import React from 'react';
* import yup from 'yup'
* import createForm from '@coverhound/react-form-validation';
*
* const FormComponent = ({ values, errors, onChange, onBlur, onSubmit }) => (
*   <form onSubmit={onSubmit}>
*     <input onChange={onChange} value={values.email} error={errors.email} />
*   </form>
* );
*
* const Form = createForm({
*   validations: {
*     email: yup.string().email().required()
*   },
*   adapter: 'yup'
* })(FormComponent);
*
* class PageWithForm extends React.Component {
*   constructor(props) {
*     super(props);
*     this.state = { errors: {} };
*     this.handleSubmit = this.handleSubmit.bind(this);
*   }
*
*   handleSubmit({ values, errors, isValid }) {
*     this.props.createResource(values).catch((err) => this.setState({ errors: err }));
*   }
*
*   render() {
*     return <Form errors={errors} onSubmit={this.handleSubmit} />
*   }
* }
*
* const mapStateToProps = () => ({});
* const mapDispatchToProps = (dispatch) => ({
*   createResource: (resourceProps) => dispatch(saveResource(resourceProps)),
* });
*
* export default connect(mapStateToProps, mapDispatchToProps)(PageWithForm);
*
*/
const createForm = ({
  validations = {},
  adapter = 'plain',
}) => (WrappedComponent) => {
  class Form extends React.Component {
    constructor(props) {
      super(props);

      this.nodes = {};
      this.fieldset = new Fieldset({ validations, adapter: adapters[adapter] });
      this.state = {
        values: props.initialValues || {},
        errors: {},
      };

      this.onChange = this.onChange.bind(this);
      this.onBlur = this.onBlur.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { children, ...props } = this.props;
      const { children: nextChildren, ...nextPropsRest } = nextProps;
      return this.fieldset.needsValidation
             || !deepEquals(this.state.errors, nextState.errors)
             || !deepEquals(props, nextPropsRest)
             || children !== nextChildren;
    }

    componentWillUpdate(nextProps, nextState) {
      this.fieldset.validate(nextState).then((errors) => {
        const { validateCallback } = nextState;
        if (validateCallback) {
          validateCallback({
            ...nextState,
            isValid: this.isValid(errors, nextProps.errors),
          });
        }

        this.setState({
          errors: { ...nextState.errors, ...errors },
          validateCallback: undefined,
        });
      });
    }

    onBlur(event) {
      const { name, value } = event.target;
      this.fieldset.triggerBlur(name);
      const values = { ...this.state.values, [name]: value || '' };

      this.nodes[name] = this.nodes[name] || event.target.cloneNode();
      this.setState({
        values,
        validateCallback: curryEvent(this.props.onBlur, this.nodes[name]),
      });
    }

    onChange(event) {
      const { name, value } = event.target;
      this.fieldset.triggerChange(name);
      const values = { ...this.state.values, [name]: value || '' };

      this.nodes[name] = this.nodes[name] || event.target.cloneNode();
      this.setState({
        values,
        validateCallback: curryEvent(this.props.onChange, this.nodes[name]),
      });
    }

    onSubmit(event) {
      event.preventDefault();
      this.fieldset.triggerSubmit();
      this.setState({
        validateCallback: curryEvent(this.props.onSubmit),
      });
    }

    isValid(stateErrors = this.state.errors, propErrors = this.props.errors) {
      return valuesFalsy(stateErrors) && valuesFalsy(propErrors);
    }

    render() {
      const { errors: propErrors } = this.props;
      const errors = Object.assign({}, this.state.errors, propErrors);

      return (
        <WrappedComponent
          {...this.props}
          errors={errors}
          values={this.state.values}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onSubmit={this.onSubmit}
          isValid={this.isValid()}
        />
      );
    }
  }

  Form.propTypes = {
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    errors: PropTypes.object,
    initialValues: PropTypes.object,
  };

  Form.defaultProps = {
    onBlur: noop,
    onChange: noop,
    onSubmit: noop,
    errors: {},
    initialValues: {},
    isSubmitting: false,
  };

  Form.WrappedComponent = WrappedComponent;
  Form.displayName = `Form(${WrappedComponent.displayName})`;

  return Form;
};

export default createForm;
