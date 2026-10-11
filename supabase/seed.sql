insert into public.categories (id, name, icon, position, is_active) values
 ('tecnologia','Tecnologia','📱',1,true),('moda','Moda','👕',2,true),('casa','Casa e Jardim','🏠',3,true),('veiculos','Veículos','🚗',4,true),('imoveis','Imóveis','🏢',5,true),('servicos','Serviços','🛠️',6,true),('desporto','Desporto','⚽',7,true),('beleza','Beleza e Saúde','✨',8,true),('criancas','Bebés e Crianças','🧸',9,true),('outros','Outros','📦',10,true)
on conflict (id) do update set name=excluded.name,icon=excluded.icon,position=excluded.position,is_active=excluded.is_active;
