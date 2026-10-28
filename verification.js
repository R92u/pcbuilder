import {verificationRecords} from './verification-data.js';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function verificationFor(part){
 if(part?.concept)return {status:'concept',label:'Учебный корпус',sources:[],values:{},limitations:[]};
 const record=verificationRecords[part?.id];
 if(!record||!Object.entries(record.values).every(([field,value])=>equal(part[field],value)))return {status:'pending',label:'Характеристики требуют проверки',sources:[],values:{},limitations:['Доступно для ручной сборки. В автосборке не используется.']};
 return {...record,status:'verified',label:'Основные характеристики проверены'};
}
export const isVerified=part=>verificationFor(part).status==='verified';
