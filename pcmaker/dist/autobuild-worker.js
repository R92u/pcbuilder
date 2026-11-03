import {autoBuild} from './autobuild.js?v=prices-20261104';
self.onmessage=({data})=>{try{self.postMessage(autoBuild(data));}catch{self.postMessage({status:'error',message:'Не удалось выполнить подбор. Попробуй ещё раз.'});}};
