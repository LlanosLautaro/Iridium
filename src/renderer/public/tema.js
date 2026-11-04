// El tema antes de la primera pintura (D-066, AJ-1): el proceso principal lo pasa en la dirección (?tema=carbon) y
// acá se pone en <html>, antes de que carguen los estilos y React. Sin el atributo rige el tema Iridium.
var tema = new URLSearchParams(location.search).get('tema')
if (tema && tema !== 'iridium') document.documentElement.setAttribute('data-tema', tema)
