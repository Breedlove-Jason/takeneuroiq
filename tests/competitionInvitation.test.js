import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rememberInvitation, pendingInvitation, competitionDestination, clearInvitation } from '../src/competition/invitation.js';
test('invitations survive sign-in, expire and cannot produce external redirects', () => {
 const storage={value:null,getItem(){return this.value},setItem(k,v){this.value=v},removeItem(){this.value=null}};
 rememberInvitation('ABCDEF123456',storage,1000);
 assert.equal(competitionDestination(storage,2000),'/compete?code=ABCDEF123456');
 assert.equal(pendingInvitation(storage,602000),'');
 storage.value=JSON.stringify({code:'//evil.example',expires:9000});
 assert.equal(competitionDestination(storage,2000),'/compete');
 rememberInvitation('ABCDEF123456',storage,1000); clearInvitation(storage);
 assert.equal(competitionDestination(storage,2000),'/compete');
});
