jest.mock('./email.js', () => ({
    enviarEmail: jest.fn().mockResolvedValue(undefined)
}));

const modelo = require("./modelo.js");
const bcrypt  = require("bcrypt");

// ─────────────────────────────────────────────────────────────
// Helpers para construir un sistema con CAD mockeado
// ─────────────────────────────────────────────────────────────
function makeSystem(cadOverrides) {
    const s = new modelo.Sistema({ test: true });
    Object.assign(s.cad, cadOverrides);
    return s;
}

// ─────────────────────────────────────────────────────────────
// 2.5 · registrarUsuario
// ─────────────────────────────────────────────────────────────
describe('registrarUsuario', function () {
    it('asigna nick=email cuando no se pasa nick', async function () {
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(undefined),
            insertarUsuario: (obj, cb) => cb(obj)
        });
        const res = await new Promise(resolve => {
            sistema.registrarUsuario({ email: 'ana@test.com', password: '1234' }, resolve);
        });
        expect(res.nick).toBe('ana@test.com');
    });

    it('devuelve {email:-1} si el email ya está registrado', async function () {
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb({ email: 'ana@test.com' })
        });
        const res = await new Promise(resolve => {
            sistema.registrarUsuario({ email: 'ana@test.com', password: '1234' }, resolve);
        });
        expect(res.email).toBe(-1);
    });

    it('guarda confirmada=false y key definida', async function () {
        let guardado;
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(undefined),
            insertarUsuario: (obj, cb) => { guardado = obj; cb(obj); }
        });
        await new Promise(resolve => {
            sistema.registrarUsuario({ email: 'ana@test.com', password: '1234' }, resolve);
        });
        expect(guardado.confirmada).toBe(false);
        expect(typeof guardado.key).toBe('string');
        expect(guardado.key.length).toBeGreaterThan(0);
    });

    it('cifra la password con bcrypt', async function () {
        let guardado;
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(undefined),
            insertarUsuario: (obj, cb) => { guardado = obj; cb(obj); }
        });
        await new Promise(resolve => {
            sistema.registrarUsuario({ email: 'ana@test.com', password: 'secreto' }, resolve);
        });
        const match = await bcrypt.compare('secreto', guardado.password);
        expect(match).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────
// 2.6 · confirmarUsuario
// ─────────────────────────────────────────────────────────────
describe('confirmarUsuario', function () {
    it('devuelve el email del usuario si la key coincide', function (done) {
        const usr = { email: 'ana@test.com', confirmada: false, key: 'abc123' };
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(usr),
            actualizarUsuario: (obj, cb) => cb({ email: obj.email })
        });
        sistema.confirmarUsuario({ email: 'ana@test.com', key: 'abc123' }, function (res) {
            expect(res.email).toBe('ana@test.com');
            done();
        });
    });

    it('pone confirmada=true en el objeto antes de actualizar', function (done) {
        let objetoActualizado;
        const usr = { email: 'ana@test.com', confirmada: false, key: 'abc123' };
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(usr),
            actualizarUsuario: (obj, cb) => { objetoActualizado = obj; cb({ email: obj.email }); }
        });
        sistema.confirmarUsuario({ email: 'ana@test.com', key: 'abc123' }, function () {
            expect(objetoActualizado.confirmada).toBe(true);
            done();
        });
    });

    it('devuelve {email:-1} si el usuario no existe o la key no coincide', function (done) {
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(undefined)
        });
        sistema.confirmarUsuario({ email: 'nadie@test.com', key: 'wrongkey' }, function (res) {
            expect(res.email).toBe(-1);
            done();
        });
    });
});

// ─────────────────────────────────────────────────────────────
// 2.7 · loginUsuario
// ─────────────────────────────────────────────────────────────
describe('loginUsuario', function () {
    it('devuelve {email:-1} si el usuario no existe', function (done) {
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(undefined)
        });
        sistema.loginUsuario({ email: 'nadie@test.com', password: '1234' }, function (res) {
            expect(res.email).toBe(-1);
            done();
        });
    });

    it('devuelve el usuario si password es correcta', async function () {
        const hash = await bcrypt.hash('correcta', 1);
        const usr = { email: 'ana@test.com', nick: 'ana@test.com', password: hash, confirmada: true };
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(usr)
        });
        const res = await new Promise(resolve => {
            sistema.loginUsuario({ email: 'ana@test.com', password: 'correcta' }, resolve);
        });
        expect(res.email).toBe('ana@test.com');
    });

    it('devuelve {email:-1} si la password es incorrecta', async function () {
        const hash = await bcrypt.hash('correcta', 1);
        const usr = { email: 'ana@test.com', password: hash, confirmada: true };
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(usr)
        });
        const res = await new Promise(resolve => {
            sistema.loginUsuario({ email: 'ana@test.com', password: 'incorrecta' }, resolve);
        });
        expect(res.email).toBe(-1);
    });

    it('añade el usuario a this.usuarios tras login correcto', async function () {
        const hash = await bcrypt.hash('pass', 1);
        const usr = { email: 'ana@test.com', nick: 'ana@test.com', password: hash, confirmada: true };
        const sistema = makeSystem({
            buscarUsuario: (_c, cb) => cb(usr)
        });
        await new Promise(resolve => {
            sistema.loginUsuario({ email: 'ana@test.com', password: 'pass' }, resolve);
        });
        expect(sistema.usuarioActivo('ana@test.com')).toBe(true);
    });
});
