jest.mock('./email.js', () => ({
    enviarEmail: jest.fn().mockResolvedValue(undefined)
}));

const modelo=require("./modelo.js");

describe('El sistema...',function(){
  let sistema;

  beforeEach(function(){
    sistema=new modelo.Sistema({test:true});
  });

  it('...puede agregar un usuario',function(){
    sistema.agregarUsuario("pepe");
    let usuarios=sistema.obtenerUsuarios();
    expect(usuarios["pepe"].nick).toBe("pepe");
  });

  it('...puede verificar si un usuario está activo',function(){
    sistema.agregarUsuario("pepe");
    expect(sistema.usuarioActivo("pepe")).toBe(true);
    expect(sistema.usuarioActivo("juan")).toBe(false);
  });

  it('...puede eliminar un usuario',function(){
    sistema.agregarUsuario("pepe");
    expect(sistema.usuarioActivo("pepe")).toBe(true);
    sistema.eliminarUsuario("pepe");
    expect(sistema.usuarioActivo("pepe")).toBe(false);
  });

  it('...puede obtener usuarios',function(){
    sistema.agregarUsuario("pepe");
    let usuarios=sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toBe(1);
    expect(usuarios["pepe"].nick).toBe("pepe");
  });

  it('...inicialmente no hay usuarios',function(){
    expect(sistema.numeroUsuarios()).toBe(0);
  });
});
