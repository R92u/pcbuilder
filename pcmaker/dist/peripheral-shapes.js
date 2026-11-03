export {keyboardLayout} from './keyboard-layout.js';
export function peripheralAppearance(p){
 const light=p.colors.includes('white')&&!p.colors.includes('black');
 return {body:light?'#dce2df':'#20262a',keys:light?'#e4e6e2':'#343d42',modifiers:light?'#b4b8b4':'#343d42',...p.appearance};
}
