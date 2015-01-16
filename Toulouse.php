<!DOCTYPE html>
<html>
	<head>
		<title>Vizurbi!</title>
		<meta charset="utf-8" />
		<meta name="Description" content="Tisseo Université Paul Sabatier UPS Open Data" />
		<!-- reset all styles. Usefull before applying several stylesheets  -->
		<link rel="stylesheet" type="text/css" href="css/reset.css" />
		<!-- Useful for the datepicker -->
		<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
		<!-- Useful for leaflet -->
		<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css" />
		<!-- All other styles -->
		<link rel="stylesheet" type="text/css" href="css/map.css" />
		<script type="text/javascript" src="javascript/jquery-2.1.1.min.js"></script>
		<script type="text/javascript" src="javascript/jquery-ui.js"></script>
		<script type="text/javascript" src="javascript/leaflet.js"></script>
		<!-- Forms : minippfix.js + modernizr.js modernizr is also used for testing localStorage-->
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
		<link rel="stylesheet"	href="plugins/fancybox/jquery.fancybox.css?v=2.1.5" type="text/css"	media="screen" />
		<script type="text/javascript"	src="plugins/fancybox/jquery.fancybox.pack.js?v=2.1.5"></script>
		<!-- <script type="text/javascript" src="javascript/carto.js"></script>-->
		<script type="text/javascript" src="javascript/loading.js"></script>
		<script type="text/javascript" src="javascript/on_off.js"></script>
		<script type="text/javascript" src="javascript/map.js"></script>
		<script type="text/javascript" src="javascript/math.js"></script>
		<script type="text/javascript" src="javascript/parameter.js"></script>
		<script type="text/javascript" src="javascript/toolbox.js"></script>
		<script type="text/javascript" src="javascript/hull.js"></script>
		<script type="text/javascript" src="javascript/grid.js"></script>
		<script type="text/javascript" src="javascript/intersect.js"></script>
		
		<script type="text/javascript">
			if (document.getElementById){
				document.write('<style type="text/css">\n')
				document.write('.sousmenu{display: none;}\n')
				document.write('</style>\n')
			}
			function menu(obj){
				if(document.getElementById){
					var el = document.getElementById(obj);
					var ar = document.getElementById("menu").getElementsByTagName("ol");
					if(el.style.display != "block"){
						for (var i=0; i<ar.length; i++){
							if (ar[i].className=="sousmenu") ar[i].style.display = "none";
						}
						el.style.display = "block";
					}
					else el.style.display = "none";
				}
			}
			function showmenu(menu) {
				if (menu.style.display=='none') menu.style.display='block';
				else menu.style.display='none';
			}
		</script>
	</head>
	
	<body id="page">
		<div id="main">
			<div id="logo"></div> 
			<div id="myMap"></div> 		
			<div id="menu">
				<table>
					<tr class="centre">
						<td>
							<div class="zoom">
								<button title="Obtenir un itineraire" onclick="menu('sousmenu1');">
								<img id="itineraire" src="./images/itineraire.png" alt="Itineraire"/>
							</div>
						</td>
					</tr>
					<!--<tr>
						<td>
							<div class="zoom">
								<button title="Obtenir des informations sur votre position" onclick="menu('menuInfoPos');"> 
								<img id="infopos" src="./images/infospos.png" alt="Infos position" />
							</div>
						</td>
					</tr>-->
					<tr>
						<td>
							<div class="zoom">
								<button title="Voir les horaires d'une ligne ou d'un arrêt" onclick="menu('menuInfoHoraire');">
								<img id="horaires" src="./images/img3.png" alt="Horaires bus" />
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<div class="zoom">
								<button onclick="menu('sousmenu4');" title="Options supplémentaires">
								<img id="balletbus" src="./images/ballet.png" alt="Ballet des bus" />
							</div>
						</td>
					</tr>
					<tr>
						<td align="center">
							<div class="zoom">
								<button class="fancybox" onclick="javascript: showmenu(document.getElementById('info'));" href="#moreinfo" title="En savoir plus">
								<img id="aide" src="./images/aide_uti.png" alt="Aide"  />
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<div class="zoom" >
								<a href="javascript:window.location.reload()">
								<img  style="margin-left:9px" src="./images/refresh.png" alt="Réinitialiser"  title="Réinitialiser" />
							</div>
						</td>
					</tr>		
				</table>
				<div id = "lignes">
				<div id="activeRoutes" style="display:none;" ></div>
				</div>
				<div id = "stylesousmenu">
					<ol>
						<li>
							<ol class="sousmenu"  id="sousmenu1">
								<form>
									<li class="premiereligne"> Départ :	</li> <br/>
									<li class="styletext"> <input id="startStation" type="text" placeholder="Arrêt" class="ppfix pre marker black"/> </li> <br/><br/>
									<li class="styletext"> Sélectionnez les lignes actives: </li><br/>
									<li class="styletext">
										<div id="routes">
											<div class="text">
												Toutes:
												<div class="onoffswitch" style="float: right">
													<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked="checked" onload="activateAllLines()" 
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
													 <label class="onoffswitch-label" for="myonoffswitch">
														<div class="onoffswitch-inner"></div>
														<div class="onoffswitch-switch"></div>
													</label>
												</div>
											</div>
											<div class="text">
												Bus:
												<div class="onoffswitch" style="float: right">
													<input type="checkbox" name="onoffswitchbus" class="onoffswitch-checkbox" id="myonoffswitchbus" checked="checked" onload="activateBusLines()" onclick="this.checked ? activateBusLines(): disactivateBusLines()" />
													<label class="onoffswitch-label" for="myonoffswitchbus">
														<div class="onoffswitch-inner"></div>
														<div class="onoffswitch-switch"></div>
													</label>
												</div>
											</div>
											<div class="text">
												Metro:
												<div class="onoffswitch" style="float: right">
													<input type="checkbox" name="onoffswitchmetro" class="onoffswitch-checkbox" id="myonoffswitchmetro" checked="checked" onload="activateSubWayLines()" onclick="this.checked ? activateSubwayLines(): disactivateSubwayLines()" />
													<label class="onoffswitch-label" for="myonoffswitchmetro">
														<div class="onoffswitch-inner"></div>
														<div class="onoffswitch-switch"></div>
													</label>
												</div>
											</div>
											<div class="text">
												Tramway:
												<div class="onoffswitch" style="float: right">
													<input type="checkbox" name="onoffswitchtram" class="onoffswitch-checkbox" id="myonoffswitchtram" checked="checked" onload="activateTramwayLines()" onclick="this.checked ? activateTramwayLines(): disactivateTramwayLines()" />
													<label class="onoffswitch-label" for="myonoffswitchtram">
														<div class="onoffswitch-inner"></div>
														<div class="onoffswitch-switch"></div>
													</label>
												</div>
											</div>
									</li><br/>
									<li>
										<input style="font-family : arial,verdana,sans-serif; font-size: 14px;color: #ffffff;margin-left:50px; font-weight:bold;" type="button" value="Activer / désactiver les lignes" onclick="showmenu(document.getElementById('activeRoutes'));" href  /><br/>
									</li><br/>
									<li class="styletext"> 
										<div class="zoom">
											<button style="margin-left:120px" onClick="this.form.reset();" title="Réinitialiser" ><img src="./images/rafraichir.png" id="reinit" alt="réinitialiser" ></button>
										</div>
									</li><br/>
							   </form>
						  </ol>
						</li>
						<li>
							<ol class="sousmenu" id="menuInfoHoraire">
								<li class="premiereligne"> Choix de l'arrêt: </li><br/>
								<li class="styletext"> 
									<!-- <input id="form_arret" type="text" class="styletext2" name="arret"/> -->
									<input id="startStation2" type="text" placeholder="Arrêt" class="ppfix pre marker black"/>
								</li><br/>
								<li class="styletext">
									Ou choisir ligne :
									<select id="Choix_ligne" name="ligne" size="1">
										<option value="me"></option>
										<option value="me">A</option>
										<option value="tr">B</option> <br/>
										<option value="bu">T1</option>
										<option value="bu">1</option>
										<option value="bu">2</option>
										<option value="bu">3</option>
										<option value="bu">8</option>
										<option value="bu">10</option>
										<option value="bu">12</option>
										<option value="bu">14</option>
										<option value="bu">15</option>
										<option value="bu">L16</option>
										<option value="bu">17</option>
										<option value="bu">19</option>
										<option value="bu">20</option>
										<option value="me">21</option>
										<option value="tr">22</option>
										<option value="bu">23</option>
										<option value="bu">25</option>
										<option value="bu">26</option>
										<option value="bu">27</option>
										<option value="bu">29</option>
										<option value="bu">30</option>
										<option value="bu">32</option>
										<option value="bu">33</option>
										<option value="bu">34</option>
										<option value="bu">35</option>
										<option value="bu">36</option>
										<option value="bu">37</option>
										<option value="bu">38</option>
										<option value="bu">39</option>
										<option value="bu">40</option>
										<option value="bu">41</option>
										<option value="bu">42</option>
										<option value="bu">43</option>
										<option value="bu">45</option>
										<option value="bu">46</option>
										<option value="bu">47</option>
										<option value="bu">48</option>
										<option value="bu">49</option>
										<option value="bu">50</option>
										<option value="bu">51</option>
										<option value="bu">52</option>
										<option value="bu">53</option>
										<option value="bu">54</option>
										<option value="bu">55</option>
										<option value="bu">56</option>
										<option value="bu">57</option>
										<option value="bu">58</option>
										<option value="bu">59</option>
										<option value="bu">60</option>
										<option value="bu">61</option>
										<option value="bu">62</option>
										<option value="bu">63</option>
										<option value="bu">64</option>
										<option value="bu">65</option>
										<option value="bu">66</option>
										<option value="bu">67</option>
										<option value="bu">68</option>
										<option value="bu">69</option>
										<option value="bu">70</option>
										<option value="bu">71</option>
										<option value="bu">72</option>
										<option value="bu">73</option>
										<option value="bu">74</option>
										<option value="bu">75</option>
										<option value="bu">76</option>
										<option value="bu">77</option>
										<option value="bu">78</option>
										<option value="bu">79</option>
										<option value="bu">80</option>
										<option value="bu">81</option>
										<option value="bu">82</option>
										<option value="bu">83</option>
										<option value="bu">84</option>
										<option value="bu">87</option>
										<option value="bu">88</option>
										<option value="bu">109</option>
										<option value="bu">110</option>
										<option value="bu">111</option>
										<option value="bu">112</option>
										<option value="bu">113</option>
										<option value="bu">114</option>
										<option value="bu">115</option>
										<option value="bu">116</option>
										<option value="bu">117</option>
									</select>
									<input type="submit" value="OK"> </input>
								</li>
							</ol>
						</li>
						<li>
							<ol class="sousmenu" id="sousmenu4"><br/>
								<li class="styletext"> <a href="javascript:toggleVehicleMovie();">Ballet des bus  </a></li><br/>
								<li class="styletext" > <a href="javascript:toggleDayMovie();">	Au fil de la journée </a></li><br/>
								<li class="styletext"> <a href="javascript:toggleLineMovie();"> Etat du réseau  </a></li><br/>
								<li class="styletext"> <a href="javascript:toggleLineDelay();"> Retard du réseau  </a></li><br/>
								<a class="orang awesome" href="javascript:PlayPause();"> 	<span class="video" id="animation">lecture</span></a>
								<br/><br/><br/>
							</ol>
						</li>
					</ol>
				</div>
			</div>
			<div id="menuSlide">
				<br/>
				Temps de trajet : <input type="texte" id="maxMinute" style="border: 0; color: gray; font-weight: bold; width: 100px; text-align: center;">	<br/><br/>		
				<div id="slider-minute-vertical" style="height: 10px; width:200px; margin-left:40px"></div><br/><br/>
				Date : <input type="text" id="datepicker" /></br></br>
				Partir à : <input type="texte" name="startHour" id="startHour" style="border: 0; color: gray; font-weight: bold; width: 100px; text-align: center;"></br>
				<!--<input type="text" name="startHour" id="startHour" style="width: 20%; color: #000000; text-align: center" />--></li><br/>
				<div id="slider-hour-vertical" style="height:10px; width:200px; margin-left:40px"></div>
			</div>
			<div id="menuSup">
				<input id="ville" type="button"  title="Changer de ville" onclick="showmenu(document.getElementById('villes'));"/>
				<ul style="display:none;" id="villes"> 
					<li> Toulouse </li> <br/>
					<li> Nantes </li> <br/>
					<li> Metz </li> <br/>
					<li> Lille </li> <br/>
				</ul>
				<input type="button" title="Afficher les infos réseau" onclick="showmenu(document.getElementById('notifres'));" id="inforeseau"/>
				<div id="notifres" style="display:none;" >
					<object data="./Alert/planifiedIncident.txt" />
				</div>
			</div>
		</div>
		<div style="display: none" id="moreinfo">
			<h2>Vizurbi! Le réseau Tisséo en un coup l'&oelig;il</h2> <br/>
			<h3>Je sélectionne un arrêt et je connais instantanément...</h3> <br/>
			<ul>
				<li style="list-style-type: square;">... les zones de la ville accessibles en transports en commun et/ou à pied en un temps donné : elles sont colorées du vert vers le rouge.</li>
				<li style="list-style-type: square;">... le plus court trajet de cet arrêt vers tous les autres, simplement en les survolant (on peut survoler tous les arrêts, même ceux qui ne sont pas accessibles rapidement).</li>
			</ul><br/>
			<p> Pour sélectionner un arrêt de départ : il suffit de cliquer dessus sur la carte ou le saisir dans la zone de texte dédiée.</p><br/>
			<h3>Et si je veux changer...</h3> <br/>
			<ul>
				<li style="list-style-type: square;">... le temps de transport,</li>
				<li style="list-style-type: square;">... l'heure de départ,</li>
				<li style="list-style-type: square;">... le jour de départ,</li>
			</ul><br/>
			<p>il suffit de régler ces paramètres dans la zone de contrôle à droite.</p> <br/> 
			<p>Les arrêts accessibles en fonction du jour/heure de départ et du temps de trajet sont colorés du vert (les plus proches) au rouge (les plus lointains).</p><br/>
			<p>Le bouton « Réinitialiser » efface la coloration des arrêts.</p><br/>
			<h3>Mais j'ai besoin des horaires !</h3><br/>
			<p>Un clic droit sur un arrêt permet de connaître les horaires de passage à l’arrêt, tandis qu'un clic droit sur une ligne donne tous les horaires de la ligne. Les lignes ressortent en noir lorsqu'on les survole.</p><br/>
			<h3>Il y a d'autres fonctionnalités ?</h3><br/>
			<p> Oui, en passant en <i>mode avancé</i>.</p><br/>
			<p>Il est alors possible d’activer/désactiver des lignes, soit en cliquant dessus, soit en les sélectionnant dans le panneau de contrôle. Les lignes peuvent également être activées/désactivées en fonction de leur type (bus, métro, tramway). Les temps de trajet sont automatiquement recalculés.</p><br/>
			<p>En survolant une ligne de bus/métro/tram dans la liste en bas à droite, on la fait ressortir en noir. En cliquant avec le bouton droit, on affiche ses horaires (alors qu'en cliquant avec le bouton gauche, on l'active ou désactive).</p><br/>
			<p>Le bouton « Au fil de la journée » permet de voir où on peut aller en fonction de l'heure : pour l'arrêt de départ et un temps de trajet sélectionnés, une animation montre les endroits accessibles à l'heure choisie, puis une minute plus tard, encore une minutes plus tard, etc...</p><br/>
			<p>Le bouton « le ballet des bus » montre le film de tous les bus, métros et trams en circulation au fil de la journée ! En activant / désactivant les lignes, on peut se concentrer sur celles qui nous intéressent.</p><br/>
			<h3>Vizurbi! : pour qui ? pour quoi ?</h3> <br/>
			<p>Les usages sont multiples :</p> <br/>
			<p>
				<ul>
					<li style="list-style-type: square;">avoir une image globale du réseau de transport toulousain,</li>
					<li style="list-style-type: square;">connaître le trajet le plus court pour aller d’un point à un autre et préparer son itinéraire,</li>
					<li style="list-style-type: square;">vérifier les temps de trajet d’un point à une autre en fonction de l’heure de la journée et décider de la meilleure heure pour partir,</li>
					<li style="list-style-type: square;">consulter facilement les horaires de chaque ligne et de chaque arrêt,</li>
					<li style="list-style-type: square;">choisir où emménager pour être à moins de 20 (ou 30, ou 10) minutes de son lieu de travail,</li>
					<li style="list-style-type: square;">visualiser l’impact d’une ligne sur la desserte globale, et ainsi permettre l’optimisation du réseau,</li>
					<li style="list-style-type: square;">voir la position de chaque bus à tout instant...</li>
				</ul>
			</p> <br/>
			<h3>Quelques détails techniques</h3><br/>
			<p> Les données utilisées pour ce site sont libérées chaque semaine par <a href="https://data.toulouse-metropole.fr/les-donnees/-/opendata/card/14505-api-temps-reel-tisseo">Tisseo</a>, au format GTFS. </p><br/>
			<p> Les temps de trajet à pied ont été évalués par l’<a href="https://developers.google.com/maps/documentation/distancematrix/?hl=fr">API Google Distance Matrix</a>. </p><br/>
			<p> Les visualisations sur la carte sont faite grâce à l'API <a href="http://leafletjs.com/">Leaflet</a>, basée sur l'initiative <a href="http://www.openstreetmap.org/">OpenStreetMap</a>. </p><br/>
			<p> Le site est optimisé pour Chrome version >=37 et fonctionne également sous les versions récentes de Firefox, Internet Explorer,Opera... (mais pas sous Safari). </p> <br/>
			<h3>Contact :</h3> <br/>
			<p> <a href="http://www.math.univ-toulouse.fr/~agarivie/">Aurélien Garivier</a> (Institut de Mathématiques de Toulouse, IMT, <a href="mailto:Aurelien.Garivier@math.univ-toulouse.fr">mail</a>), </p>
			<p> <a href="http://www.irit.fr/page-perso/Karen.Pinel-Sauvagnat/">Karen Pinel-Sauvagnat</a> (Institut de Recherche en Informatique de Toulouse, IRIT, <a href="mailto:karen.sauvagnat@irit.fr">mail</a>). </p>
			<p> Enseignants-Chercheurs à <a href="http://www.univ-tlse3.fr/">l’Université Paul Sabatier</a>. </p> 
			<br/>
			<p> Cet outil va être utilisé/amélioré dans le cadre de la formation <a href="https://cmisid.univ-tlse3.fr/">CMI SID</a>.</p><br/>
			<p> Copyright (C) 2014 Aurélien Garivier, Karen Pinel-Sauvagnat. Application web sous <a href="http://www.math.univ-toulouse.fr/~agarivie/carto/appli/LICENCE.txt"> GNU General Public License version 3.</a> </p><br/>
		</div>
		<script>
			var ua = navigator.userAgent, index, navigateur, version;
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
			$( function() { // options: add controls!
				withAllSubRoutes = false;
				withoutUnlinkedStops = true;
				withOnlyParentStations = true;	
				if (Modernizr.localstorage) { loadWS(); } 
				else { load(); }
				});
				$(document).ready(function() {
					$(".fancybox").fancybox();
				});
		</script>
	</body>
</html>