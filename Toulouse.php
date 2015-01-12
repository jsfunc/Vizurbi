<!DOCTYPE html>
<html>
<head>
<title>Vizurbi!</title>

<meta name="Description"
	content="Tisseo Université Paul Sabatier UPS Open Data" />
<meta charset="UTF-8">
<!-- reset all styles. Usefull before applying several stylesheets  -->
<link rel="stylesheet" type="text/css" href="css/reset.css" />
<!-- Useful for the datepicker -->
<link rel="stylesheet"
	href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
<!-- Useful for leaflet -->
<link rel="stylesheet"
	href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css" />
<!-- All other styles -->
<link rel="stylesheet" type="text/css" href="css/map.css" />

<link rel="stylesheet"
	href="plugins/fancybox/jquery.fancybox.css?v=2.1.5" type="text/css"
	media="screen" />

<script type="text/javascript" src="javascript/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="javascript/jquery-ui.js"></script>
<script type="text/javascript" src="javascript/leaflet.js"></script>
<!-- Forms : minippfix.js + modernizr.js
		modernizr is also used for testing localStorage-->
<script type="text/javascript" src="javascript/minippfix.js"></script>
<script type="text/javascript" src="javascript/modernizr.js"></script>

<!-- Reading zip files -->
<!-- <script type="text/javascript" src="javascript/jsunzip.js"></script> -->
<script type="text/javascript" src="plugins/zip/zip.js"></script>
<script type="text/javascript" src="plugins/zip/mime-types.js"></script>
<script type="text/javascript" src="plugins/zip/inflate.js"></script>

<!-- Reading csv files -->
<script type="text/javascript" src="javascript/papaparse.js"></script>

<!-- Waiting spinner : spin.js + leaflet.spin.js-->
<script type="text/javascript" src="javascript/spin.js"></script>
<script type="text/javascript" src="javascript/leaflet.spin.js"></script>

<!-- Add fancyBox, modal window -->

<script type="text/javascript"
	src="plugins/fancybox/jquery.fancybox.pack.js?v=2.1.5"></script>


<!-- <script type="text/javascript" src="javascript/carto.js"></script> -->
<script type="text/javascript" src="javascript/toolbox.js"></script>
<script type="text/javascript" src="javascript/loading.js"></script>
<script type="text/javascript" src="javascript/map.js"></script>
<script type="text/javascript" src="javascript/on_off.js"></script>
<script type="text/javascript" src="javascript/parameter.js"></script>
<script type="text/javascript" src="javascript/math.js"></script>

</head>

<body id="page">

	<header>
		<div id="topnav">
			<div id="logo"></div>

			<div id="city" class="toulouse">Toulouse</div>

			<div id="buttons">
				<a class="orange1 awesome fancybox" style="float: right"
					data-role="button" href="#moreinfo"
					title="Carte interactive de visualisation isochrone pour les transports en commun toulousains">
					<span class="question"> En savoir plus &raquo; </span>
				</a> 
				<a class="orange2 awesome fancybox" style="float: right"
					data-role="button" href="javascript:reset();"> 
					<span class="refresh"> Réinitialiser </span>
				</a> 
				<a class="orange3 awesome fancybox" style="float: right"
					data-role="button" href="javascript:toggleAdvancedMode();">
					 <span class="advanced" id="advancedbutton"> Vers le mode avancé </span>
				</a>

				<div id="buttonsadv" style="display: none">
					<a class="orange4 awesome" style="float: right"
						href="javascript:toggleDayMovie();">
						<span class="video" id="vid">Au fil de la journée </span>
					</a> 
					<a class="orange5 awesome"
						style="float: right" href="javascript:toggleVehicleMovie();">
						<span class="video" id="vehicleMovie"> Le ballet des bus </span>
					</a>
				</div>
				<!--<a class="orange3 awesome" style="float:right" href="failed.php"><span class="meet"> On se rencontre où? </span></a> -->

			</div>
			<hr style="width: 100%; position: absolute; top: 54px;" />

		</div>
	</header>

	<div id="main">
		<div id="myMap"></div>
		<div id="control">

			<div id="station">
				<input id="startStation" type="text" placeholder="Arrêt de départ"
					class="ppfix pre marker green" />
			</div>
			
			<div id="sliders">
				<div id="timeslider">
					<label for="maxMinute">Temps de trajet</label> 
					<input type="text"
						id="maxMinute"
						style="border: 0; color: #f6931f; font-weight: bold; width: 100%; text-align: center;">
					<div id="slider-minute-vertical"
						style="height: 200px; margin: auto;"></div>
				</div>
				<div id="hourslider">
					<label for="startHour">Heure de départ</label> <input type="text"
						id="startHour"
						style="border: 0; color: #f6931f; font-weight: bold; width: 100%; text-align: center;">
					<div id="slider-hour-vertical" style="height: 200px; margin: auto"></div>

				</div>

			</div>

			<div id="day">
				Jour de départ: <input type="text" id="datepicker" />
			</div>

			<div id="controladv" style="display: none">
				<div id="controlboxActiveRoutes">
					Sélectionnez les lignes actives: <br />
					<div id="routes">

						<div style="width: 240px; height: 30px; text-indent: 10px; font-weight: normal;">
							Toutes:
							<div class="onoffswitch" style="float: right">
								<input type="checkbox" name="onoffswitch"
									class="onoffswitch-checkbox" id="myonoffswitch"
									checked="checked" onload="activateAllLines()"
									onclick="if (this.checked){
        					 	activateAllLines();
        					 	document.getElementById('myonoffswitchbus').checked = true;
        					 	document.getElementById('myonoffswitchmetro').checked = true;
        					 	document.getElementById('myonoffswitchtram').checked = true;
        					 	}
        					 else{
            					 disactivateAllLines();
            					 document.getElementById('myonoffswitchbus').checked = false;
            					 document.getElementById('myonoffswitchmetro').checked = false;
            					 document.getElementById('myonoffswitchtram').checked = false;
            					 }" /> 
            					 <label class="onoffswitch-label"
									for="myonoffswitch">
									<div class="onoffswitch-inner"></div>
									<div class="onoffswitch-switch"></div>
								</label>
							</div>
						</div>

						<div style="width: 240px; height: 30px; text-indent: 10px; font-weight: normal;">
							Bus:
							<div class="onoffswitch" style="float: right">
								<input type="checkbox" name="onoffswitchbus"
									class="onoffswitch-checkbox" id="myonoffswitchbus"
									checked="checked" onload="activateBusLines()"
									onclick="this.checked ? activateBusLines(): disactivateBusLines()" />
								<label class="onoffswitch-label" for="myonoffswitchbus">
									<div class="onoffswitch-inner"></div>
									<div class="onoffswitch-switch"></div>
								</label>
							</div>
						</div>

						<div style="width: 240px; height: 30px; text-indent: 10px; font-weight: normal;">
							Metro:
							<div class="onoffswitch" style="float: right">
								<input type="checkbox" name="onoffswitchmetro"
									class="onoffswitch-checkbox" id="myonoffswitchmetro"
									checked="checked" onload="activateSubWayLines()"
									onclick="this.checked ? activateSubwayLines(): disactivateSubwayLines()" />
								<label class="onoffswitch-label" for="myonoffswitchmetro">
									<div class="onoffswitch-inner"></div>
									<div class="onoffswitch-switch"></div>
								</label>
							</div>
						</div>

						<div style="width: 240px; height: 30px; text-indent: 10px; font-weight: normal;">
							Tramway:
							<div class="onoffswitch" style="float: right">
								<input type="checkbox" name="onoffswitchtram"
									class="onoffswitch-checkbox" id="myonoffswitchtram"
									checked="checked" onload="activateTramwayLines()"
									onclick="this.checked ? activateTramwayLines(): disactivateTramwayLines()" />
								<label class="onoffswitch-label" for="myonoffswitchtram">
									<div class="onoffswitch-inner"></div>
									<div class="onoffswitch-switch"></div>
								</label>
							</div>
						</div>

					</div>
				</div>

				<div id="morecontroladv">
					Activer / désactiver les lignes :<br />
					<div id="activeRoutes"></div>
					<div id="animationVelocity">
						<label for="sleepDelay">Vitesse de l'animation :</label> 
						<input
							type="text" id="sleepDelay"
							style="border: 0; color: #f6931f; font-weight: bold; width: 100%; text-align: center; margin: 0px;">
						<div id="slider-animation-velocity"
							style="width: 200px; margin: auto;"></div>
					</div>
				</div>
				
				
			</div>
		</div>

	</div>

	<script>
		var ua = navigator.userAgent,
    		index,
    		navigateur,
    		version;
		if((index = ua.indexOf('Firefox'))>=0) {
    		navigateur = 'Firefox';
    		version = ua.match(/Firefox\/([0-9]+(?:\.[0-9]+)*)/)[1];
		} else if((index = ua.indexOf('MSIE'))>=0) {
    		navigateur = 'Internet Explorer';
    		version = ua.match(/MSIE ([0-9]+(?:\.[0-9]+)*)/)[1];
		} else if((index = ua.indexOf('Chrome'))>=0) {
    		navigateur = 'Google Chrome';
    		version = ua.match(/Chrome\/([0-9]+(?:\.[0-9]+)*)/)[1];
		} else if((index = ua.indexOf('Opera'))>=0) {
    		navigateur = 'Opera';
    		version = ua.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1] || ua.match(/Opera\/([0-9]+(?:\.[0-9]+)*)/)[1];
		} else if((index = ua.indexOf('Safari'))>=0) {
    		navigateur = 'Safari';
    		version = ua.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1] || ua.match(/Safari\/([0-9]+(?:\.[0-9]+)*)/)[1];
		}
		/*alert(navigateur+' '+version);*/
		if (navigateur == 'Safari') {
			alert('Ce site ne fonctionne pas sous votre navigateur ('+navigateur+' '+version+'). Merci d\'utiliser Google Chrome version >=37.');
			document.body.innerHTML="";
		}
		else if (navigateur!='Google Chrome' && navigateur!='Firefox' && navigateur != 'Internet Explorer' && navigateur != 'Opera') {
			alert('Ce site est optimisé pour Google Chrome version >=37, et fonctionne également sous les versions récentes de Firefox, Internet Explorer, Opera...');
		}
		
	</script>

	<script type="text/javascript">
				$(function() {// options: add controls!
					withAllSubRoutes = false;
					withoutUnlinkedStops = true;
					withOnlyParentStations = true;	
					if (Modernizr.localstorage) {    
    					loadWS();
					} else {    
   						load();
					}
					});
					
					$(document).ready(function() {
						$(".fancybox").fancybox();
					});
						
				</script>



	<div style="display: none">
		<div id="moreinfo">
			<h2>Vizurbi! Le réseau Tisséo en un coup l'&oelig;il</h2>
			<br />
			<h3>Je sélectionne un arrêt et je connais instantanément...</h3>
			<br />
			<ul>
				<li style="list-style-type: square;">... les zones de la ville
					accessibles en transports en commun et/ou à pied en un temps donné
					: elles sont colorées du vert vers le rouge.</li>
				<li style="list-style-type: square;">... le plus court trajet de cet
					arrêt vers tous les autres, simplement en les survolant (on peut
					survoler tous les arrêts, même ceux qui ne sont pas accessibles
					rapidement).</li>
			</ul>
			<br /> Pour sélectionner un arrêt de départ : il suffit de cliquer
			dessus sur la carte ou le saisir dans la zone de texte dédiée. <br />
			<br />
			<h3>Et si je veux changer...</h3>
			<br />
			<ul>
				<li style="list-style-type: square;">... le temps de transport,</li>
				<li style="list-style-type: square;">... l'heure de départ,</li>
				<li style="list-style-type: square;">... le jour de départ,</li>
			</ul>
			<br />
			<p>il suffit de régler ces paramètres dans la zone de contrôle à
				droite.</p>
			<br />
			<p>Les arrêts accessibles en fonction du jour/heure de départ et du
				temps de trajet sont colorés du vert (les plus proches) au rouge
				(les plus lointains).</p>
			<br />
			<p>Le bouton « Réinitialiser » efface la coloration des arrêts.</p>
			<br />
			<h3>Mais j'ai besoin des horaires !</h3>
			<br />

			<p>Un clic droit sur un arrêt permet de connaître les horaires de
				passage à l’arrêt, tandis qu'un clic droit sur une ligne donne tous
				les horaires de la ligne. Les lignes ressortent en noir lorsqu'on
				les survole.</p>

			<br />
			<h3>Il y a d'autres fonctionnalités ?</h3>
			<br />
			<p>
				Oui, en passant en <i>mode avancé</i>.
			</p>
			<br />
			<p>Il est alors possible d’activer/désactiver des lignes, soit en
				cliquant dessus, soit en les sélectionnant dans le panneau de
				contrôle. Les lignes peuvent également être activées/désactivées en
				fonction de leur type (bus, métro, tramway). Les temps de trajet
				sont automatiquement recalculés.</p>

			<br />
			<p>En survolant une ligne de bus/métro/tram dans la liste en bas à
				droite, on la fait ressortir en noir. En cliquant avec le bouton
				droit, on affiche ses horaires (alors qu'en cliquant avec le bouton
				gauche, on l'active ou désactive).</p>

			<br />
			<p>Le bouton « Au fil de la journée » permet de voir où on peut aller
				en fonction de l'heure : pour l'arrêt de départ et un temps de
				trajet sélectionnés, une animation montre les endroits accessibles à
				l'heure choisie, puis une minute plus tard, encore une minutes plus
				tard, etc...</p>

			<br />
			<p>Le bouton « le ballet des bus » montre le film de tous les bus,
				métros et trams en circulation au fil de la journée ! En activant /
				désactivant les lignes, on peut se concentrer sur celles qui nous
				intéressent.</p>


			<br />
			<h3>Vizurbi! : pour qui ? pour quoi ?</h3>
			<br />
			<p>Les usages sont multiples :</p>
			<br />
			<p>
			<ul>
				<li style="list-style-type: square;">avoir une image globale du
					réseau de transport toulousain,</li>
				<li style="list-style-type: square;">connaître le trajet le plus
					court pour aller d’un point à un autre et préparer son itinéraire,</li>
				<li style="list-style-type: square;">vérifier les temps de trajet
					d’un point à une autre en fonction de l’heure de la journée et
					décider de la meilleure heure pour partir,</li>
				<li style="list-style-type: square;">consulter facilement les
					horaires de chaque ligne et de chaque arrêt,</li>
				<li style="list-style-type: square;">choisir où emménager pour être
					à moins de 20 (ou 30, ou 10) minutes de son lieu de travail,</li>
				<li style="list-style-type: square;">visualiser l’impact d’une ligne
					sur la desserte globale, et ainsi permettre l’optimisation du
					réseau,</li>
				<li style="list-style-type: square;">voir la position de chaque bus
					à tout instant...</li>
			</ul>
			</p>
			<br />

			<h3>Quelques détails techniques</h3>
			<br />
			<p>
				Les données utilisées pour ce site sont libérées chaque semaine par
				<a
					href="https://data.toulouse-metropole.fr/les-donnees/-/opendata/card/14505-api-temps-reel-tisseo">Tisseo</a>,
				au format GTFS.
			</p>
			<br />
			<p>
				Les temps de trajet à pied ont été évalués par l’<a
					href="https://developers.google.com/maps/documentation/distancematrix/?hl=fr">API
					Google Distance Matrix</a>.
			</p>
			<br />
			<p>
				Les visualisations sur la carte sont faite grâce à l'API <a
					href="http://leafletjs.com/">Leaflet</a>, basée sur l'initiative <a
					href="http://www.openstreetmap.org/">OpenStreetMap</a>.
			</p>
			<br />
			<p>
				Le site est optimisé pour Chrome version >=37 et fonctionne
				également sous les versions récentes de Firefox, Internet Explorer,
				Opera... (mais pas sous Safari). <br /> <br />
			
			
			<h3>Contact :</h3>
			<br />
			<p>
				<a href="http://www.math.univ-toulouse.fr/~agarivie/">Aurélien
					Garivier</a> (Institut de Mathématiques de Toulouse, IMT, <a
					href="mailto:Aurelien.Garivier@math.univ-toulouse.fr">mail</a>),
			</p>
			<p>
				<a href="http://www.irit.fr/page-perso/Karen.Pinel-Sauvagnat/">Karen
					Pinel-Sauvagnat</a> (Institut de Recherche en Informatique de
				Toulouse, IRIT, <a href="mailto:karen.sauvagnat@irit.fr">mail</a>).
			</p>
			<p>
				Enseignants-Chercheurs à <a href="http://www.univ-tlse3.fr/">l’Université
					Paul Sabatier</a>.
			</p>
			<br />

			<p>
				Cet outil va être utilisé/amélioré dans le cadre de la formation <a
					href="https://cmisid.univ-tlse3.fr/">CMI SID</a>.
			
			
			<p>
				Copyright (C) 2014 Aurélien Garivier, Karen Pinel-Sauvagnat.
				Application web sous <a
					href="http://www.math.univ-toulouse.fr/~agarivie/carto/appli/LICENCE.txt">
					GNU General Public License version 3.</a>
			</p>
		</div>
	</div>
</body>
</html>






