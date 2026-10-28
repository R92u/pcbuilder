const verificationError='Не удалось проверить безопасность соединения с Маркетом. Обнови страницу и проверь, что браузер разрешает загрузку reCAPTCHA Google.';

// The reCAPTCHA SDK can remain pending when its script is blocked. Keep the
// gallery retryable without allowing any Firebase access before attestation.
export async function requireAppCheckToken(requestToken){
 let timer;
 try{
  return await Promise.race([
   requestToken(),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('App Check timed out')),20000);})
  ]);
 }catch{throw Error(verificationError);}
 finally{clearTimeout(timer);}
}
