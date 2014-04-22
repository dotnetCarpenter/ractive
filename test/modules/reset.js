define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'ractive.reset()' );

		test( 'Basic reset', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{one}}{{two}}{{three}}',
				data: { one: 1, two: 2, three: 3 }
			});

			ractive.reset({ two: 4 });
			t.htmlEqual( fixture.innerHTML, '4' );
		});

		test( 'Invalid arguments', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
			});

			throws(function(){
				ractive.reset("data");
			})

			//Assuming that data fn's are not allowed on reset
			//caller could just execute themselves:
			//ractive.reset(fn(), cb)
			//Otherwise introduces ambiguity...
			throws(function(){
				ractive.reset(function(){}, function(){});
			})
			
		});

		asyncTest( 'Callback and promise with reset', function ( t ) {
			var ractive = new Ractive({
					el: fixture,
					template: '{{one}}{{two}}{{three}}',
					data: { one: 1, two: 2, three: 3 }
				}),
				callback = function(){
					ok(true);
					start();
				}

			expect(6)
			ractive.reset({ two: 4 }, callback);
			t.htmlEqual( fixture.innerHTML, '4' );
			ractive.reset({ one: 9 }).then(callback);
			t.htmlEqual( fixture.innerHTML, '9' );
			ractive.reset(callback);
			t.htmlEqual( fixture.innerHTML, '' );
		});

		asyncTest( 'Dynamic template functions are recalled on reset', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: function(d, o, t){
					return d.condition ? '{{foo}}' : '{{bar}}'
				},
				data: { foo: 'fizz', bar: 'bizz', condition: true }
			});

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.set('condition', false)
			ractive.reset(ractive.data).then(start);
			t.htmlEqual( fixture.innerHTML, 'bizz' );
			
		});	

		asyncTest( 'Callback and promise with dynamic template functions are recalled on reset', function ( t ) {
			var ractive = new Ractive({
					el: fixture,
					template: function(d, o, t){
						return d.condition ? '{{foo}}' : '{{bar}}'
					},
					data: { foo: 'fizz', bar: 'bizz', condition: true }
				}),
				callback = function(){
					ok(true);
					start();
				}

			expect(5);

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.set('condition', false)
			ractive.reset(ractive.data).then(callback);
			t.htmlEqual( fixture.innerHTML, 'bizz' );
			ractive.set('condition', true)
			ractive.reset(ractive.data, callback);
			t.htmlEqual( fixture.innerHTML, 'fizz' );
			
		});		

		test( 'resetTemplate rerenders with new template', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'fizz', bar: 'bizz' }
			});

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.resetTemplate('{{bar}}')
			t.htmlEqual( fixture.innerHTML, 'bizz' );
			
		});	

		test( 'resetTemplate with no template change doesnt rerender', function ( t ) {
			var p, ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>',
				data: { foo: 'fizz' }
			});

			p = ractive.find('p');
			t.htmlEqual( fixture.innerHTML, '<p>fizz</p>' );
			ractive.resetTemplate('<p>{{foo}}</p>');
			t.htmlEqual( fixture.innerHTML, '<p>fizz</p>' );
			t.equal( ractive.find('p'), p);	
			ractive.resetTemplate('<p>bar</p>');
			t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );
			t.notEqual( ractive.find('p'), p);	
		});	

	};

});
