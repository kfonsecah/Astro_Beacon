**UNIVERSIDAD NACIONAL, SEDE REGIONAL BRUNCA
EIF411 Diseño y Programación de Plataformas Móviles
Prof. Daniel Granados Murilo**

# PROYECTO FINAL

# “Exploración planetaria”

```
Objetivo
```
Involucrar al estudiantado en la solución de un proyecto informático completo de mediana

complejidad, mediante el desarrollo de una aplicación móvil, el diseño de la infraestructura

para su operación y la implementación en un ambiente real, para reforzar el aprendizaje y

validar los conocimientos adquiridos durante el tiempo del curso.

```
Aspectos generales
```
1. Lea y comprenda cuidadosamente lo que se le solicite.
2. El Proyecto puede ser realizado en grupos de 4 personas como máximo, según
    capacidad del grupo y aceptación del cambio. La idea de que trabajen hasta 3- 4
    estudiantes es para disminuir la carga en cuanto a tener que hacer la API igual, el logger,
    seguridad y conexión con base de datos, y que se centren en lo interesante del proyecto,
    las soluciones propias y consigan un cumplimiento cercano al 100%.
3. El día de entrega, el proyecto será defendido de manera individual. La nota será mérito
    personal por lo que deben conocer todas las particularidades del sistema y tener pruebas
    de trabajo realizado en cuanto a documentación y repositorio Github.
4. Se deben respetar las etapas del proyecto mencionadas en el programa del curso:
    Se trabaja con 3 etapas.
    Base Inicial ( 10 %): Se revisa la arquitectura y diseño del trabajo, diseño de datos y páginas
    web y la conexión con la API.

```
Aplicación Base ( 15 %): Se revisan las funcionalidades del sistema final y se proponen
cambios para la defensa final, refactorización de código, y seguridad.
```
```
Defensa y presentación del Proyecto ( 20 %): Se revisa la implementación del sistema, Estrés
de la aplicación con datos, Cumplimiento de requerimientos y pruebas de integración.
Nota: Si el proyecto no tiene un 80% del alcance solicitado, pierde la posibilidad de realizar la
presentación final.
```

5. Si se comprueba que existen dos o más proyectos similares o copiados, se procederá a
    colocar nota cero a todos los proyectos involucrados.
6. Se requiere acceso durante toda la revisión al repositorio de GitHub, donde está el
    proyecto, así mismo debe compartir una carpeta en drive con la copia final del código
    fuente como respaldo, y los archivos de documentación adicionales. Deben subir al
    Aula Virtual solo un archivo de texto con los dos enlaces solicitados, ambos enlaces
    deben apuntar a repositorios compartidos con la cuenta
    daniel.granados.dev.566@gmail.com en tiempo y forma.
7. Fechas importantes:
    a) Entrega del enunciado: semana I, 18 de febrero
    b) Entrega 1: semana 7, 08 de abril
    c) Entrega 2: semana 11, 06 de mayo
    d) Entrega y defensa del proyecto: semana 15, 3 de junio.

**Contexto del proyecto**


Houston, tenemos un problema! Ha ocurrido lo que todos temen, una astronauta ha tenido un
accidente en un planeta desconocido, desde la tierra solo nos llegan pequeños mensajes

encriptados, donde sabemos que aún está con vida, debemos ayudarlo a sobrevivir en esta crisis

hasta que otra misión espacial vaya por él.

Por lo cual, debemos crear una aplicación para su dispositivo de viaje manual (móvil), la cual

debe ayudarlo a sobrevivir, dicha herramienta deberá tener las siguientes especificaciones.

```
Requerimientos del sistema.
```
```
Requerimiento Progreso
```
```
Bitácora de lo desconocido
```
```
1 - El sistema deberá permitir tomar fotos y hacer una breve descripción por el
astronauta, luego, esta imagen será analizada y clasificada de forma automática, según
la especie, o forma de vida que se ha descubierto, además debe de guardarse en los
registros, para una consulta fácil y rápida.
Las clasificaciones debe definirlas el estudiante, aunque como mínimo debe estar
(recursos, animales, plantas, etc), además se debe saber si una forma de vida es
peligrosa o amigable. También debe permitir cargar imágenes, esto de información
que podamos encontrar por el mundo.
```
```
2 - Debe tener la opción, de investigar a un ser de nuestra bitácora con una foto, es
decir, si ya existe en nuestra bitácora, debe de ser detectado mostrado al astronauta de
forma fácil y clara
```
```
3 - El sistema deberá poseer la funcionalidad de narrar (audio) cuál es la forma de
vida, con respecto a los contenidos de la bitácora.
```
```
4 - Se debe tener la opción de descargar la bitácora por un tiempo, en caso de quedarse
sin conexión, además si se toma una foto, y no se encuentra en línea, el sistema debe
de recuperar esos datos y enviarlos a procesar cuando regrese la conexión.
```

```
Requerimiento Progreso
```
```
Gestión de recursos
```
```
1 - Se debe de tener un registro de los recursos que tiene el astronauta, oxígeno,
comida, agua, etc. (El estudiante debe definir más y deben identificar cuáles deben
estar siempre a la vista)
```
```
2 - Se deben de generar alertas cuando un recurso esté por debajo de un mínimo
establecido.
```
```
3 - Se debe categorizar los recursos, de forma que sea fácil agregar o disminuir los
recursos, debe de tener un registro de estos ingresos y egresos.
```
Requerimiento Progreso

```
Recursos y viajes
```
1 - La NASA envía suministros de forma recurrente, estos suministros caen cerca del
lugar de la nave, además tienen un GPS, la aplicación debe mostrar un mapa con la
ubicación de dichos recursos.

2 - Cuando se inicia un viaje, en buscar recursos, se debe iniciar el recorrido y se debe
tener en cuenta el oxígeno que gasta el astronauta fuera de su nave, en donde se debe
ir reduciendo la cantidad de oxígeno prevista para el viaje según pasa el tiempo.

3 - Cuando el astronauta recupera los recursos y vuelve a su nave, debe realizar un
conteo de los nuevos recursos obtenidos. - (Ingreso de los nuevos recursos)


```
Requisitos No Funcionales:
```
```
Arquitectura y tecnología.
```
```
El sistema debe desarrollarse bajo una arquitectura moderna orientada a servicios, con una
separación clara entre la aplicación móvil y la API. La comunicación entre ambas capas debe
realizarse mediante una API versionada y documentada, permitiendo la escalabilidad y el
mantenimiento del sistema.
El frontend debe implementarse utilizando React native con TypeScript , aplicando una
organización por capas o por funcionalidades, así como patrones de diseño apropiados al
desarrollo frontend moderno en entornos de desarrollo móvil, debidamente justificados por el
estudiante.
```
```
Criterios de aceptación:
```
```
● Existe separación clara entre frontend y backend.
```
```
● El proyecto utiliza React native y Typescript.
```
```
● La estructura del código es coherente y justificable en la defensa.
```
## Desarrollo asistido por inteligencia artificial

```
El proyecto debe incorporar de manera explícita el uso de inteligencia artificial como apoyo
al diseño y desarrollo del sistema. El estudiante debe evidenciar cómo la IA fue utilizada para
apoyar decisiones técnicas, generación de código, reglas de negocio o procesamiento de
información.
Las decisiones automatizadas relevantes deben ser explicables , permitiendo al usuario final
comprender los criterios utilizados y validar o corregir dichas decisiones cuando sea necesario.
```
```
Criterios de aceptación:
```
Requerimiento Progreso

```
Generales
```
1 - Se debe crear una pantalla principal en la cual se puedan tener métricas
importantes sobre datos del campamento y la bodega.

2 - Se debe implementar seguridad de la aplicación.

3 - Se debe implementar un diseño, animaciones y estilos conforme al contexto del
proyecto.

4 - Implementar gestos (al menos 2) para diferentes procesos de la aplicación, (debe de
describirse el porqué de estos)


```
● Se documenta el uso de IA en el desarrollo del proyecto.
```
```
● Las decisiones asistidas por IA muestran criterios claros y trazables.
```
```
● El usuario puede revisar y aceptar o corregir decisiones automatizadas.
```
## Calidad de código y buenas prácticas

El código fuente debe cumplir estándares profesionales de desarrollo, promoviendo la
mantenibilidad y la legibilidad. Se debe integrar el uso de **ESLint, Prettier y CSpell** como
parte del flujo de trabajo, así como configuraciones estrictas de TypeScript.
La aplicación debe seguir las buenas prácticas de **React** , incluyendo componentes
reutilizables, separación de responsabilidades y manejo adecuado del estado y los efectos.

**Criterios de aceptación:**

```
● El proyecto pasa por validaciones de linting y formateo.
● El código es consistente, legible y bien organizado.
● Se evidencia el uso correcto de prácticas modernas de React y el desarrollo móvil.
```
## Experiencia de usuario, animaciones y gamificación

La aplicación debe ofrecer una experiencia de usuario moderna, coherente con el contexto del
proyecto, integrando **animaciones avanzadas y microinteracciones** que refuercen la narrativa
y el feedback al usuario.
Asimismo, el sistema debe incluir elementos de **gamificación** , como progresos, niveles, logros
o recompensas visuales, integrados de forma funcional a los procesos del sistema.

**Criterios de aceptación:**

```
● Existen animaciones coherentes y funcionales (cargas, transiciones, acciones).
```
```
● La gamificación aporta valor real a la experiencia del usuario.
```
```
● La interfaz mantiene coherencia visual y temática.
```
## Rendimiento y adaptabilidad

El sistema debe optimizar el uso de recursos mediante mecanismos como **paginación, carga
diferida y manejo eficiente de procesos asíncronos** , evitando sobrecargar la interfaz del
usuario.
La aplicación debe ser **responsive** , garantizando una experiencia adecuada en dispositivos
móviles de varios tamaños.

**Criterios de aceptación:**


```
● La aplicación gestiona correctamente grandes volúmenes de información.
```
```
● El comportamiento es adecuado en conexiones lentas.
```
```
● El diseño se adapta correctamente a distintos tamaños de pantalla.
```
## Seguridad, control de acceso y sesión

El sistema debe implementar mecanismos de **autenticación** , restringiendo el acceso a la
información según el perfil del usuario.
La sesión del usuario debe expirar tras un período de inactividad, bloqueando el acceso hasta
una nueva autenticación.

**Criterios de aceptación:**

```
● El acceso a la información está correctamente restringido.
```
```
● La sesión expira tras inactividad.
```
## Uso del offline

El sistema debe implementar mecanismos de **offline,** permitiendo al usuario el ingresar a ver

información previamente descargada, y logrando una sincronización con el servidor cuando

se vuelve al modo online.

**Criterios de aceptación:**

```
● Se puede utilizar la aplicación en modo offline en la mayoría de los apartados.
```
```
● El sistema se sincroniza de forma correcta al volver al estado online.
```

```
Criterios de evaluación
```
Como directriz de la cátedra se establece como obligatoria la defensa del proyecto, por parte

de todos los miembros del grupo, la nota será siempre tomada de manera individual.

La presente rúbrica permite evaluar los proyectos basados en los siguientes rubros:

```
Rubro Valor
```
1. Base Inicial
Se revisa la arquitectura y diseño del trabajo, diseño de datos y una base
de la app.

```
10%
```
2. Aplicación Base
Se revisan las funcionalidades del sistema final y se proponen cambios
para la defensa final, refactorización de código, y seguridad.

```
15%
```
3. Defensa del proyecto y presentación
Se revisa la implementación del sistema, se realizan pruebas de estrés de
la aplicación con muchos datos, se valora el cumplimiento de los
requerimientos y se revisan las pruebas de integración y procesos.
**Nota: Si el proyecto no tiene un 80% del alcance solicitado, pierde la posibilidad de
realizar la presentación final.**

```
20%
```
```
Total 100%
```
La escala de puntos indica el rango de puntos en los que puede ser puntuado cada uno de los

criterios de la rúbrica según los avances o proyecto presentado por el estudiante.

**1. Base inicial (10 puntos).**

```
Rubro Alto (6 a 8) Suficiente (2 a 5) Bajo (0 a 1)
```
Arquitectura y diseño del
trabajo.

```
Realiza un esfuerzo alto
por agregar y entender las
relaciones de los
componentes de la
aplicación, lo demuestra
en un diagrama de draw.io
o similar
```
```
Hay falencias en la
interpretación de los
elementos y las relaciones
de los componentes de la
aplicación o el diagrama
presenta pocos detalles a
mejorar.
```
```
No realiza el trabajo, es
vago en su realización o
no cumple con lo
solicitado
```
Diseño móvil

```
Presenta un diseño
completo de las
principales pantallas,
utiliza metáforas comunes
del desarrollo móvil,
demuestra interés y
creatividad, el mockup es
bastante completo. Conoce
```
```
Presenta un diseño
bastante bueno, faltan
algunos detalles, rutas o
páginas importantes, o los
diseños son muy simples o
enredados.
```
```
No demuestra interés en
lograr el diseño, o lo
realiza vagamente o tiene
faltantes más de dos
páginas importantes.
```

```
todas las posibles rutas
```
Diseño de datos

```
Presenta un diseño
completo de las
principales entidades,
documentos, atributos y
sus relaciones, demuestra
interés, análisis y
creatividad, el diseño es
bastante completo. Conoce
todas las posibles rutas
```
```
Presenta un diseño
bastante bueno, faltan
algunos detalles, atributos
o relaciones, o los diseños
son muy simples o
enredados.
```
```
No demuestra interés en
lograr el diseño, o lo
realiza vagamente, o tiene
faltantes más de dos
entidades importantes.
```
Conexión con la API.

```
Se desarrolla la API del
sistema, y se consume
desde la aplicación.
```
```
Solo existe la API, está
bien formada, tiene pocos
faltantes o presenta algún
bug menor.
```
```
No existe la API, está
incompleta, o no está bien
formada
```
**2. Aplicación Base (15 puntos).**

```
Rubro Alto (6 a 8) Suficiente (2 a 5) Bajo (0 a 1)
```
```
Funcionamiento integral
de la aplicación
```
```
Se desarrolló el aplicativo
completo. Puede que le
falten detalles menores a
mejorar o detalles de
diseño u optimización.
```
```
Se desarrollaron parte de
los elementos/
requerimientos del
aplicativo solicitado, pero
queda pendiente gran parte
del mismo. Lo que se hizo
funciona al menos al 50%,
o presenta varios errores
considerables.
```
```
Existe más de un 50% de
faltantes en la aplicación,
o no funcionan
correctamente, o están mal
estructuradas, o no tienen
control de errores.
```
```
API Funcional y datos
bien formados
```
```
Presenta una API
completa, robusta, bien
estructurada y funcional,
tiene seguridad, requiere
pocas refactorizaciones
```
```
Presentan una API casi
completa con faltantes en
optimización o falta
manejo completo de
errores.
```
```
No existe la API, está en
estado básico o tiene
faltantes para el manejo de
entidades o errores.
```
**3. Defensa Del Proyecto y presentación del proyecto (20 puntos)**

```
Rubro Alto (6 a 8) Suficiente (2 a 5) Bajo (0 a 1)
```
```
Aspecto visual final
```
```
Se desarrolló desde el
inicio una aplicación
agradable a la vista, en
donde se toma en cuenta al
usuario, siendo amigable,
evitando acciones
innecesarias mejorando la
velocidad de los procesos,
tiene un diseño
relacionado con la
```
```
Se desarrolló en parte un
aspecto visual agradable,
con algunas carencias en
aspectos de amabilidad de
usuario, comodidad visual,
usabilidad y el diseño de
la web no mejora los
procesos
```
```
Existen una gran
deficiencia en el diseño,
aspectos como amabilidad
con el usuario, usabilidad
son casi nulos, el diseño
entorpece el proceso.
```

```
temática y además cada
pantalla tiene el mismo
nivel de detalle
```
```
Funcionamiento integral
de la aplicación.
```
```
Se desarrolló el aplicativo
completo. Se corrigen los
detalles de la evaluación
anterior
```
```
Se desarrollaron parte de
los elementos/
requerimientos del
aplicativo solicitado, pero
queda pendiente gran parte
de este. Lo que se hizo
funciona al menos al 70%,
o presenta varios errores
considerables.
```
```
Existe más de un 30% de
faltantes en la aplicación,
o no funcionan
correctamente, o están mal
estructuradas, o no tienen
control de errores.
```
```
API Funcional y datos
bien formados
```
```
Presenta una API
completa, robusta, bien
estructurada y funcional,
tiene seguridad y está
refactorizada
```
```
Presentan una API casi
completa (80%) con
faltantes en optimización o
falta manejo completo de
errores.
```
```
No existe la API, está en
estado básico o tiene
faltantes para el manejo de
entidades o errores.
```
```
Pruebas de estrés
```
```
El sistema cuenta con
mecanismos para trabajar
con volúmenes de datos
altos, o mejorar la carga al
usuario, y los estudiantes
muestran este
funcionamiento según lo
sugerido.
```
```
El sistema presenta
algunas pruebas o estas
fallan, se realiza un muy
buen intento por parte de
los estudiantes.
```
```
No hay acciones para
mejorar el rendimiento de
la aplicación, o su carga, o
no se aplican
correctamente, o el
esfuerzo es insuficiente.
```
Presentación del proyecto

```
Presentan un proyecto
basado en objetivos y
soluciones y conclusiones,
involucran a los
compañeros y atienden
todas las dudas señaladas.
```
```
Presenta el proyecto de
una manera básica,
atienden las dudas
señaladas o la
presentación es aburrida o
no involucra al público.
```
```
No presentan el proyecto,
no está bien estructurada
la presentación, o no
atienden dudas o no las
pueden responder.
```
Recomendaciones y
conclusiones

```
Presenta una
documentación completa
del proyecto e incluye
recomendaciones y
conclusiones importantes.
```
```
Presenta la documentación
completa y las
recomendaciones y
conclusiones no son
significativas.
```
```
No presenta
documentación, o no
presenta conclusiones o
recomendaciones.
```
Presentación del proyecto

```
Presentan un proyecto
basado en objetivos y
soluciones y conclusiones,
involucran a los
compañeros y atienden
todas las dudas señaladas.
```
```
Presenta el proyecto de
una manera básica,
atienden las dudas
señaladas o la
presentación es aburrida o
no involucra al público.
```
```
No presentan el proyecto,
no está bien estructurada
la presentación, o no
atienden dudas o no las
pueden responder.
```

