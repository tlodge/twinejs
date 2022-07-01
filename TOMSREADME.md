## Modifications to core twine

* src/components/rules 

the files that deal with the rule creation interface

* src/components/onstart 

the files that deal with the onstart creation interface

* src/util/caravan 

the code that translated between twine and the format required by the future mundane state machine

* src/routes/story-list/toolbar/story/export-stories-button 

the code for the ui that handles exporting to the caravan

* src/routes/story-list/toolbar/story/story-actions

downloads and attempts to export to caravan: 
            
```await request.post('/author/save').set('Content-Type', 'application/json').send({name,layer:_stories});```

* NB - not using choosetype anymore as this is selected in the rules interface 