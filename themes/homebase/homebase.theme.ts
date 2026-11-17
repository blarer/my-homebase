// The homebase theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in homebase.settings.json and the generated homebase.settings.ts;
// change them with `astryx experimental theme editor set homebase ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {homebaseSettings} from './homebase.settings';

export const homebaseTheme = defineTheme({
  extends: homebaseSettings,
  name: 'homebase',
});
