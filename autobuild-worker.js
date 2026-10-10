import {autoBuild} from './autobuild.js';
self.onmessage=({data})=>{try{self.postMessage(autoBuild(data));}catch{self.postMessage({status:'error',message:'Не удалось выполнить подбор. Попробуй ещё раз.'});}};
