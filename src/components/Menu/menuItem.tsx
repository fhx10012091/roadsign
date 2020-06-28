import React, {useContext} from 'react'
import classNames from 'classnames'
import {MenuContext} from './menu'
export interface MenuItemProps {
    index?: number;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const MenuItem: React.FC<MenuItemProps> = (props) => {
    const {index, disabled, className, style, children} = props
    const menuContext = useContext(MenuContext)

    const classes = classNames('menu-item', className, {
        'is-disabled': disabled,
        'is-active': menuContext.index === index && !disabled
    })
    const handleClick = () => {
        if (menuContext.onSelect && !disabled && (typeof index === 'number')) {
            menuContext.onSelect(index)
        }
    }
    return (
        <li className={classes} style={style} onClick={handleClick}>
            {children}
        </li>
    )
}

MenuItem.displayName = 'MenuItem'

export default MenuItem
