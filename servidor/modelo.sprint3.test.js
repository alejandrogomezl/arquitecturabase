jest.mock('./email.js', () => ({
    enviarEmail: jest.fn().mockResolvedValue(undefined)
}));

const modelo=require("./modelo.js");

describe("Pruebas de las partidas",function(){
    let sistema;
    let usr1,usr2,usr3;

    beforeEach(function(){
        sistema=new modelo.Sistema({test:true});
        usr1={nick:"Pepa",email:"pepa@pepa.es"};
        usr2={nick:"Pepo",email:"pepo@pepo.es"};
        usr3={nick:"Pipo",email:"pipo@pipo.es"};
        sistema.agregarUsuario(usr1);
        sistema.agregarUsuario(usr2);
        sistema.agregarUsuario(usr3);
    });

    it("Usuarios y partidas en el sistema",function(){
        expect(sistema.numeroUsuarios()).toEqual(3);
        expect(sistema.obtenerPartidasDisponibles().length).toEqual(0);
    });

    it("Crear partida",function(){
        let codigo=sistema.crearPartida(usr1.email);
        expect(codigo).not.toBe(-1);
        expect(sistema.partidas.length).toEqual(1);
        expect(sistema.partidas[0].jugadores.length).toEqual(1);
    });

    it("Unir a partida",function(){
        let codigo=sistema.crearPartida(usr1.email);
        let res=sistema.unirAPartida(usr2.email,codigo);
        expect(res).toBe(codigo);
        expect(sistema.partidas[0].jugadores.length).toEqual(2);
    });

    it("Un usuario no puede estar dos veces",function(){
        let codigo=sistema.crearPartida(usr1.email);
        let res=sistema.unirAPartida(usr1.email,codigo);
        expect(res).toBe(-1);
    });

    it("Obtener partidas",function(){
        let codigo=sistema.crearPartida(usr1.email);
        expect(sistema.obtenerPartidasDisponibles().length).toEqual(1);
        sistema.unirAPartida(usr2.email,codigo);
        expect(sistema.obtenerPartidasDisponibles().length).toEqual(0);
    });
});
