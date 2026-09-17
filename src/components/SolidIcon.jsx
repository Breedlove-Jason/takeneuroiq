import { createElement } from 'react';

/** Filled, locally bundled icons; inherit text size and color. */
export default function SolidIcon({ icon, className = '', style, ...props }) {
  return createElement(icon, {
    ...props,
    weight: 'fill',
    size: '1em',
    'aria-hidden': true,
    className: `inline-block shrink-0 align-[-0.125em] ${className}`,
    style,
  });
}
