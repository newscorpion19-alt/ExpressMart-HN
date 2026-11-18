const fs=require('fs');
const P=(id,nombre,categoria,precio,stock,descripcion,sinonimos=[])=>({id,nombre,categoria,precio,stock,disponible:stock>0,descripcion,sinonimos});
const productos=[
P('P001','Agua purificada 600 ml','Bebidas',12,150,'Botella de agua purificada sin gas.',['agua','botellita de agua']),
P('P002','Refresco de cola 2 L','Bebidas',38,60,'Gaseosa sabor cola, botella familiar.',['gaseosa','soda','coca','cola']),
P('P003','Leche deslactosada 1 L','Lácteos',36.5,25,'Leche entera sin lactosa en caja.',['leche sin lactosa','deslactosada']),
P('P004','Pan de molde integral','Panadería',45,0,'Pan de molde integral rebanado, 600 g.',['pan integral','pan de caja','pan']),
P('P005','Papas fritas 140 g','Snacks',32,80,'Bolsa de papas fritas sabor natural.',['papitas','chips','boquitas']),
P('P006','Jabón de baño (3 unidades)','Higiene',55,40,'Paquete de tres jabones de tocador.',['jabon','jabón de tocador']),
P('P007','Detergente en polvo 1 kg','Limpieza',68,18,'Detergente en polvo para ropa.',['jabón en polvo','detergente','lavar ropa']),
P('P008','Jugo de naranja 1 L','Bebidas',42,35,'Jugo de naranja en caja, sin azúcar añadida.',['jugo','zumo']),
P('P009','Agua purificada 1 galón','Bebidas',45,50,'Garrafón de agua purificada de 3.78 L.',['galon de agua','garrafa']),
P('P010','Bebida energizante 473 ml','Bebidas',35,45,'Lata de bebida energizante.',['energizante','energética']),
P('P011','Cerveza lata 355 ml','Bebidas',28,120,'Cerveza nacional en lata. Venta solo a mayores de 18 años.',['birra','cerveza','lata']),
P('P012','Té frío de limón 500 ml','Bebidas',22,40,'Té frío sabor limón.',['te frio','té helado']),
P('P013','Leche entera 1 L','Lácteos',32,40,'Leche entera en caja.',['leche']),
P('P014','Yogurt natural 1 L','Lácteos',48,22,'Yogurt natural sin azúcar.',['yogur','yogurt']),
P('P015','Queso fresco 1 lb','Lácteos',70,15,'Queso fresco tipo hondureño, empacado.',['queso','quesillo']),
P('P016','Mantequilla 225 g','Lácteos',44,20,'Barra de mantequilla con sal.',['mantequilla','margarina']),
P('P017','Crema 200 g','Lácteos',30,28,'Crema fresca en bolsa.',['crema','natilla']),
P('P018','Pan francés (6 unidades)','Panadería',30,30,'Bolsa de seis panes franceses del día.',['pan francés','pan blanco','bolillo']),
P('P019','Pan para hamburguesa (6 unidades)','Panadería',38,25,'Bolsa de seis panes para hamburguesa.',['pan de hamburguesa','pan de hamburguesas']),
P('P020','Tortillas de maíz (paquete 12)','Panadería',25,0,'Paquete de doce tortillas de maíz.',['tortillas','tortilla de maiz']),
P('P021','Galletas de soda','Snacks',20,70,'Paquete de galletas saladas.',['galletas saladas','galleta']),
P('P022','Galletas rellenas de chocolate','Snacks',18,90,'Paquete de galletas rellenas.',['galletas de chocolate','galleta rellena']),
P('P023','Platanitos fritos 100 g','Snacks',24,65,'Bolsa de platanitos fritos.',['platanitos','tajadas','chips de plátano']),
P('P024','Maní salado 100 g','Snacks',20,55,'Bolsa de maní salado.',['mani','cacahuate']),
P('P025','Chocolate en barra 40 g','Snacks',15,100,'Barra de chocolate con leche.',['chocolate','barra de chocolate']),
P('P026','Shampoo 400 ml','Higiene',85,26,'Shampoo para uso diario.',['champú','champu']),
P('P027','Pasta dental 100 ml','Higiene',38,45,'Crema dental con flúor.',['crema dental','pasta de dientes','colgate']),
P('P028','Desodorante en barra','Higiene',62,30,'Desodorante antitranspirante en barra.',['desodorante']),
P('P029','Papel higiénico (4 rollos)','Higiene',48,60,'Paquete de cuatro rollos de papel higiénico.',['papel de baño','papel toalet','papel']),
P('P030','Toallas sanitarias (10 unidades)','Higiene',42,35,'Paquete de diez toallas sanitarias.',['toallas femeninas','toallitas']),
P('P031','Cloro 1 L','Limpieza',28,40,'Cloro desinfectante.',['lejía','blanqueador','cloro']),
P('P032','Lavaplatos líquido 500 ml','Limpieza',40,32,'Jabón líquido para trastes.',['jabón de trastes','lavatrastes','lava platos']),
P('P033','Desinfectante de piso 1 L','Limpieza',52,22,'Desinfectante aroma lavanda.',['desinfectante','limpiapisos']),
P('P034','Esponja de cocina (2 unidades)','Limpieza',18,50,'Paquete de dos esponjas.',['esponja','fibra']),
P('P035','Bolsas de basura (10 unidades)','Limpieza',35,38,'Bolsas de basura medianas.',['bolsas de basura','bolsas']),
P('P036','Arroz 1 lb','Abarrotes',16,100,'Arroz blanco grano largo.',['arroz']),
P('P037','Frijoles rojos 1 lb','Abarrotes',24,80,'Frijoles rojos de seda.',['frijoles','frijol']),
P('P038','Aceite vegetal 500 ml','Abarrotes',46,35,'Aceite vegetal de cocina.',['aceite']),
P('P039','Huevos (cartón de 30)','Abarrotes',120,12,'Cartón de treinta huevos.',['huevos','cartón de huevos']),
P('P040','Recarga celular L 50','Recargas',50,999,'Recarga de saldo por L 50 para línea celular. Requiere número de teléfono al ordenar en la tienda.',['recarga','saldo','tigo','claro'])
];
const horarios={
 tienda:'ExpressMart HN', ciudad:'San Pedro Sula, Cortés, Honduras', moneda:'Lempiras (L)',
 horario:{lunes_a_sabado:{abre:'07:00',cierra:'21:00'},domingo:{abre:'08:00',cierra:'18:00'}},
 horario_texto:'Lunes a sábado de 7:00 a. m. a 9:00 p. m.; domingos de 8:00 a. m. a 6:00 p. m.',
 envio:{zona:'San Pedro Sula',costo:40,gratis_desde:500,tiempo_estimado:'45 a 90 minutos'},
 pagos:['Efectivo contra entrega','Tarjeta','Transferencia'],
 estados_pedido:['Recibido','En preparación','En camino','Entregado'],
 whatsapp:'+504 9999-0000 (número ficticio de ejemplo)',
 politicas:['No se venden bebidas alcohólicas a menores de 18 años.','Los pedidos solo se consultan con el número de pedido (formato EM-0000).','El stock mostrado es simulado y puede variar.']
};
const byId=Object.fromEntries(productos.map(p=>[p.id,p]));
const mk=(id,estado,items,pago,fecha,hora,zona)=>{
 const subtotal=items.reduce((s,[i,c])=>s+byId[i].precio*c,0);
 const envio=subtotal>=500?0:40;
 return {id,estado,fecha,hora_pedido:hora,zona,items:items.map(([i,c])=>({id:i,producto:byId[i].nombre,cantidad:c,precio_unitario:byId[i].precio})),subtotal,envio,total:subtotal+envio,metodo_pago:pago};
};
const pedidos=[
 mk('EM-1038','Entregado',[['P001',6],['P005',2]],'Efectivo contra entrega','2026-10-16','10:15','Col. Rivera Hernández'),
 mk('EM-1039','Entregado',[['P013',2],['P018',1],['P039',1]],'Tarjeta','2026-10-16','14:40','Col. Los Andes'),
 mk('EM-1040','Entregado',[['P007',2],['P031',1],['P032',1]],'Transferencia','2026-10-17','09:05','Barrio Suyapa'),
 mk('EM-1041','En camino',[['P002',2],['P005',3],['P025',4]],'Efectivo contra entrega','2026-10-18','18:20','Col. Trejo'),
 mk('EM-1042','En camino',[['P003',2],['P014',1],['P015',1]],'Tarjeta','2026-10-18','18:35','Col. Jardines del Valle'),
 mk('EM-1043','En preparación',[['P036',5],['P037',4],['P038',2],['P039',2]],'Transferencia','2026-10-18','18:50','Barrio Guamilito'),
 mk('EM-1044','En preparación',[['P029',2],['P027',1],['P026',1]],'Efectivo contra entrega','2026-10-18','19:02','Col. Satélite'),
 mk('EM-1045','Recibido',[['P010',3],['P011',6]],'Efectivo contra entrega','2026-10-18','19:10','Col. Alameda'),
 mk('EM-1046','Recibido',[['P006',2],['P028',1]],'Tarjeta','2026-10-18','19:12','Col. Fesitranh'),
 mk('EM-1047','Recibido',[['P009',2],['P001',12]],'Transferencia','2026-10-18','19:15','Col. Jardines del Valle')
];
const w=(f,o)=>fs.writeFileSync('data/'+f,JSON.stringify(o,null,2));
w('productos.json',productos);w('horarios.json',horarios);w('pedidos.json',pedidos);
console.log(productos.length,pedidos.map(p=>p.id+':'+p.total).join(' '));
