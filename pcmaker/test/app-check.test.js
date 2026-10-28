import test from 'node:test';
import assert from 'node:assert/strict';
import {requireAppCheckToken} from '../firebase/app-check-guard.js';

test('App Check completes with an attested token and clears its timeout',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const clear=t.mock.method(globalThis,'clearTimeout'),token={token:'test-attestation'};
 assert.equal(await requireAppCheckToken(()=>Promise.resolve(token)),token);
 assert.equal(clear.mock.callCount(),1);
 assert.notEqual(clear.mock.calls[0].arguments[0],undefined);
});

test('App Check network failure rejects with a useful error and remains retryable',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const clear=t.mock.method(globalThis,'clearTimeout');
 await assert.rejects(requireAppCheckToken(()=>Promise.reject(Error('offline'))),/Обнови страницу.*reCAPTCHA Google/);
 assert.equal(clear.mock.callCount(),1);
 const token={token:'retry-attestation'};
 assert.equal(await requireAppCheckToken(()=>Promise.resolve(token)),token);
 assert.equal(clear.mock.callCount(),2);
});

test('A blocked reCAPTCHA script fails closed after 20 seconds and permits retry',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const clear=t.mock.method(globalThis,'clearTimeout');
 let settled=false,rejectLate;
 const pending=requireAppCheckToken(()=>new Promise((_,reject)=>{rejectLate=reject;}));
 const rejected=assert.rejects(pending,/Не удалось проверить безопасность/).then(()=>{settled=true;});
 t.mock.timers.tick(19999);
 await Promise.resolve();
 assert.equal(settled,false);
 t.mock.timers.tick(1);
 await rejected;
 assert.equal(clear.mock.callCount(),1);
 // A timed-out SDK request may settle later; it must not poison a new attempt.
 rejectLate(Error('late network error'));
 const token={token:'recovered-attestation'};
 assert.equal(await requireAppCheckToken(()=>Promise.resolve(token)),token);
 assert.equal(clear.mock.callCount(),2);
});
