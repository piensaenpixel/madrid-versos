window.onload = function() {

    var milestones;

    cartodb.createVis('map', 'http://team.cartodb.com/api/v2/viz/329b8c16-5a22-11e4-93c0-0e853d047bba/viz.json',{ zoomControl: false })
    .done(function(vis, layers) {

        var map = vis.getNativeMap();

        var seq = O.Sequential();
        O.Keys().left().then(seq.prev, seq);
        O.Keys().right().then(seq.next, seq);
        $('a.next').click(function() { seq.next(); })
        $('a.prev').click(function() { seq.prev(); })

        var story = O.Story();

        //var updateUI = function(txt,date,marker) { 
        var updateUI = function(txt, title) { 
            return O.Action(function() {
                console.log(title);
                $('#info > p').text(txt)
                $('#info > h2').text(title)
                //$('#milestone > span').text(txt.description)
                //$('#footer > #buttons > span').text(story.state() + '/' + milestones.length)
              }); 
        }

        var sql = new cartodb.SQL({ user: 'piensaenpixel' });
        sql.execute("SELECT cartodb_id, name, title, description, st_y(the_geom) as lat, st_x(the_geom) as lon FROM boamistura")
            .done(function(data) {

                milestones = data.rows;

                for (var i = 0; i < milestones.length; ++i) {
                    var stop = data.rows[i];
                    var pos = [stop.lat, stop.lon];
                    var txt = stop.name;
                    var title = stop.title;
                    var marker = L.icon({
                        //iconUrl: 'boamistura/img/markers/' + stop.marker + '.png',
                        iconUrl: 'img/markers/marker.png',
                        iconSize: [49,59],
                        iconAnchor: [24,56]
                    });

                    var action = O.Step(
                      map.actions.setView(pos),
                      O.Debug().log("state " + i),
                      L.marker(pos, { icon: marker }).actions.addRemove(map),
                      //updateUI(txt,date,stop.marker),
                      updateUI(txt, title),
                      O.Location.changeHash('#' + i)
                    )
                    story.addState(seq.step(i), action);
                }
                if (location.hash) {
                  seq.current(+location.hash.slice(1));
                } else {
                  story.go(0);
                }

            })
            .error(function(errors) {
                // errors contains a list of errors
                //console.log("errors:" + errors);
            });

    });
}
