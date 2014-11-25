 _   _      _         
| |_(_) ___| | ___ __ 
| __| |/ __| |/ / '__|
| |_| | (__|   <| |   
 \__|_|\___|_|\_\_|   
                      
Welcomer to the button-people-connector


Resume: This is a social network were you can connect with people around you.
			It's easy as, when you meet someone and you wanna keep their contact for the future, you both just have to push a button in the same time and now you will be able to find other person information as phone number, facebook account, gmail, and more.



For developer:

	(+) on /api you have all the api for connecting tickr.				 

	(*) Redirects
	(>) POST
	(<) GET                 

	+=====+
	|     |
	|LOGIN| First of all, to interact with the app you have to login with 
	|	  |	facebook ( next releases will have more logins)
	+=====+

		(*) /api/auth/facebook	-> Will send you to the facebook login and authorization page

		(*) /api/auth/logout	-> Will drop your session

		(<) /api/auth/userId 	-> Return the userId of the session

		(<) /api/auth/hasSession -> Return 0 if has session, 2 if not


	+=====+
	|	  |
	|Ticks| When you push the button you will generate a tick that will 
	|	  |	be saved and waits for other ticks nears, is like put you hand up
	+=====+

		(>) /api/tick 			-> It sets a new tick
									in the body you must set

									userId => Is the user id in tickr
									long   => Longitud
									lat    => Latitud	

	 	(<) /api/tick/userId	-> Gets the ticks near the user 
	 								uses the userId in the url as requester user


	+======+
	|	   |
	|Matchs| When you select someone from the ticks near you, you must set a match.
	|	   | If both set each other it will generate a match you can request with the get
	+======+

		(>) /api/match/userId	-> Set a new match between the user in the body(requester)
									and the user in the url(matched) 

									body.userId => Requester
									params.userId => Matched

		(<) /api/match/userId	-> Get all the matches for the userId in the url


	+====+
	|	 |
	|Info| Allows you to get and set user information
	|    | 
	+====+

		(>) /api/user/info 		-> Set the user information, values and visibility 
									Send this information in the body

									userId 			=> requester id
									tel 			=> user's telephone
									telVisibility 	=> user's tel visibility
									emial 			=> user's email
									emailVisibility => user's email visibility
									fb 				=> user's fb
									fbVisibility 	=> user's fb visibility

		(<) /api/user/info 		-> Gets the user information of the userId in the url
