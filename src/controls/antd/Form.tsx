import React, { Component, SFC } from 'react'
// import { inject } from 'mobx-react'
import { Form } from 'antd'
import Element from "../../core/element/Element"
// import { Store } from '../../store'
import { canBeDroped, staticMembers } from '../../core/decorator'
import ElementCategory from '../../core/element/ElementCategory'
import { ElementConsumer } from '../../core/element/ElementContext'

/**
 * 高阶组件装饰器，封装表单控件统一行为：
 * - 注入 store
 * - 监听 change 事件
 */
export function formControl(target: Object, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const oldValue = descriptor.value
  descriptor.value = function() {
    const retComp = oldValue!.apply(this) as React.ComponentType
    return wrapComponent(retComp)
  }

  return descriptor
}

export function wrapComponent(Comp: typeof Component | SFC): typeof React.Component {
  // @inject('rootStore')
  // @observer
  class RenderCls extends React.Component<{
    // rootStore: Store,
    name: string,
    label: string,
    value?: any,
    className?: string,
    onClick?: Function
  }> {
    render() {
      const { name, label, className, value: transferValue, ...props } = this.props
      // console.log('transfer value', transferValue)

      return (
        <ElementConsumer>
          {
            ({ value, onChange }) => (
              <Form.Item label={label} colon={false} className={className}>
                <Comp
                  {...props}
                  name={ name }
                  value={value ? value[name] : transferValue}
                  onChange={(e: React.ChangeEvent) => onChange!(e, name)}
                />
              </Form.Item>
            )
          }
        </ElementConsumer>
      )
    }
  }

  return RenderCls
}

@staticMembers({
  displayName: '表单',
  category: ElementCategory.FORM,
  type: 'form',
  icon: 'form',
  props: [{
    name: 'layout',
    type: 'select',
    props: {
      label: '对齐方式',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
        { label: '内联', value: 'inline' }]
    },
    default: 'horizontal',
    dataType: 'string'
  }, {
    name: 'labelCol',
    type: 'json',
    props: {
      label: '标签宽度'
    },
    default: { "span": 6 },
    dataType: 'object'
  }, {
    name: 'wrapperCol',
    type: 'json',
    props: {
      label: '内容宽度'
    },
    default: { "span": 14 },
    dataType: 'object'
  }]
})
@canBeDroped()
class InnerCls extends Element {
  _getComponent() {
    return class extends React.Component<any> {
      ref: any

      constructor(props: any) {
        super(props)
        this.ref = React.createRef()
      }

      render() {
        return (
          <Form ref={this.ref} {...this.props}>
          </Form>
        )
      }
    }
  }

  prepareProps(props: any) {
    if (props.layout !== 'horizontal') {
      props.labelCol = undefined
      props.wrapperCol = undefined
    }

    return props
  }
}

export default InnerCls
