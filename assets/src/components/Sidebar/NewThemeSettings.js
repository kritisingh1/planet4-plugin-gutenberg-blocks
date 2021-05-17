import { SelectControl } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { p4ServerThemes } from '../../theme/p4ServerThemes';
import { __ } from '@wordpress/i18n';

const keysAsLabel = obj => Object.keys(obj).map(k => ({ label: k, value: k }));

// Just a lightweight way to have a separate UI element in the sidebar so that it's clear which themes are legacy and
// which are new. This is likely just for internal usage to facilitate reviewing the refactored version, eventually
// editors will work with a single select.
const useServerThemes = () => {
  const [serverThemes, setServerThemes] = useState({});

  useEffect(async () => {
    const themes = await p4ServerThemes.fetchThemes();
    setServerThemes(themes);
  }, []);

  return serverThemes;
};

const getAllDefinedProps = () => Object.entries(document.documentElement.style).filter(([, k]) => {
  return !!('string' === typeof k && k.match(/^--/));
}).map(([, k]) => k);

const useAppliedCssVariables = (serverThemes, currentTheme) => {
  const initialVars = useState(() => getAllDefinedProps(), []);

  const applyChangesToDom = () => {
    console.log('Applying ');
    const theme = serverThemes[currentTheme] || {};
    Object.entries(theme).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });

    const customProps = getAllDefinedProps();

    customProps.forEach(k => {
      if (!Object.keys(theme).includes(k) && !initialVars.includes(k)) {
        console.log('removing', k);
        document.documentElement.style.removeProperty(k);
      }
    });
  };
  useEffect(applyChangesToDom, [serverThemes, currentTheme]);
};

export const NewThemeSettings = ({ onChange, currentTheme }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const emitOnChange = () => {

    return onChange(selectedTheme);
  };
  useEffect(emitOnChange, [selectedTheme]);
  const serverThemes = useServerThemes();
  useAppliedCssVariables(serverThemes, currentTheme);

  return <div className="components-panel__body is-opened">
    <SelectControl
      label={ __('Theme', 'planet4-blocks-backend') }
      title={ __('Only for reviewing themes, not intended to be 2 checkboxes in the final product.', 'planet4-blocks-backend') }
      options={ [{ label: 'None', value: '' }, ...keysAsLabel(serverThemes)] }
      onChange={ setSelectedTheme }
      value={ selectedTheme || '' }
    />
  </div>;
};
