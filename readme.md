## API 
![Static Badge](https://img.shields.io/badge/CONSTRU%C3%8DDO%20COM%20NODEJS-black?style=for-the-badge&logo=javascript)
[URL da api de teste](https://plamona.onrender.com)

### Rotas
#### ![Static Badge](https://img.shields.io/badge/POST-green?style=for-the-badge) /medicoes
> A rota "/medicoes" retorna os dados de períodos fixos, sendo eles: 
> - Semana Atual
> - Semana Anterior
> - Dia Atual

##### Query:
>As querys utilizadas para fazer a requisição para api pelo meio do método POST são: 
```json
{"periodo" : "semana"} // Semana atual
{"periodo" : "semanaAnterior"} // Semana anterior
{"periodo" : "dia"} // Dia atual
```

##### Resultado:
>Os dados são retornados em um JSON. Sendo "id" o identificador do período que vai aparecer nos gráficos, "color" a cor que iria aparecer nos gráficos, e "data" são os pontos X e Y onde os níveis vão aparecer nos gráficos.
>*(Os níveis irão aparecer nos gráficos com duas casas decimais por que os gráficos contam com um tratamento automático)*
```json
[
 {
	"id":"Semana Atual",
	"color":"#3633f9",
	"data":[
		{
		"x":"dom.",
		"y":4.462916672229767
		},
		{
		"x":"seg.",
		"y":2.3800000150998435
		},
		{
		"x":"ter.",
		"y":2.139583314458529
		},
		{
		"x":"qua.",
		"y":1.6754166632890701
		},
		{
		"x":"qui.",
		"y":3.9137500325838723
		},
		{
		"x":"sex.",
		"y":5.208750009536743
		},
		{
		"x":"sáb.",
		"y":5.5
		}
	]
 }
]
```


#### ![Static Badge](https://img.shields.io/badge/POST-green?style=for-the-badge) /comparacao
> A rota comparação retorna dados de dois dias que são inseridos pelo usuário. Pela query também é possível indicar o período que deseja ser inserido

##### Query
> A query é feita da seguinte maneira:
```json
{
	"periodo" : "semana",
	"comp_1" : "2023-10-11T03:00:00.000Z",
	"comp_2" : "2023-10-10T03:00:00.000Z"
}
```
> "periodo" pode ser:
> - "semana" -> Média de cada dia da semana
> - "mes" -> Média de cada dia do mês
> - "ano" -> Média de cada mês
> - "dia" -> Níveis por hora
> - "diaEsp" -> Retorna o mesmo que o dia, porém retorna só um dia (Utilizado no gráfico com flechas)
>
> "comp_1" e "comp_2" recebem datas dessa forma: "2023-10-11T03:00:00.000Z", pois o input de date utilizado as envia dessa forma.

#### Resultado
> Os dados são retornados em um JSON. Sendo "id" o identificador do período que vai aparecer nos gráficos, "color" a cor que iria aparecer nos gráficos, e "data" são os pontos X e Y onde os níveis vão aparecer nos gráficos. 
>*(Os níveis irão aparecer nos gráficos com duas casas decimais por que os gráficos contam com um tratamento automático)*
```json
[
 {
	"id":"15/09/2023",
	"color":"#3633f9",
	"data":[
		{
		"x":"dom.",
		"y":4.462916672229767
		},
		{
		"x":"seg.",
		"y":2.3800000150998435
		},
		{
		"x":"ter.",
		"y":2.139583314458529
		},
		{
		"x":"qua.",
		"y":1.6754166632890701
		},
		{
		"x":"qui.",
		"y":3.9137500325838723
		},
		{
		"x":"sex.",
		"y":5.208750009536743
		},
		{
		"x":"sáb.",
		"y":5.5
		}
	]
 },
 {
	"id":"23/09/2023",
	"color":"#3633f9",
	"data":[
		{
		"x":"dom.",
		"y":4.462916672229767
		},
		{
		"x":"seg.",
		"y":2.3800000150998435
		},
		{
		"x":"ter.",
		"y":2.139583314458529
		},
		{
		"x":"qua.",
		"y":1.6754166632890701
		},
		{
		"x":"qui.",
		"y":3.9137500325838723
		},
		{
		"x":"sex.",
		"y":5.208750009536743
		},
		{
		"x":"sáb.",
		"y":5.5
		}
	]
 }
]

```