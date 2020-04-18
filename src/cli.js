import arg from 'arg'
import inquirer from 'inquirer'
import { PathPrompt } from 'inquirer-path';
import svgSprite from '../src/index';

function parsArguments(rawArgs){
	const args=arg({
		'--add': Boolean,
		'--get': Boolean,
		'--remove': Boolean,
		'-a':'--add',
		'-g':'--get',
		'-rm':'--remove',
	},{argv:rawArgs.slice(2)});
	return{
		add:args['--add'] || false,
		get:args['--get'] || false,
		remove:args['--remove'] || false
	}
}

async function getParams(options){
	const qs={
		path:{
			type:'path',
			name:'path',
			message:'Please provide a directory to your sprite sheet',
			default:options.path || options.src || __dirname
		},
		name:{
			type:'input',
			name:'name',
			message:'Please provide an name for the sprite sheet (will be created if non-existent)',
			default:options.name || 'icons.svg'
		},
		src:{
			type:'path',
			name:'src',
			message:'Please provide a location to your SVG file or your SVG directory',
			default:options.path || options.src || __dirname
		},
		id:{
			type:'input',
			name:'id',
			message:'Please provide an icon ID to be removed',
			default:options.id
		},
	};
	const questions=[];
	if(options.add)
		questions.push(qs.path,qs.name,qs.src);
	else if(options.get)
		questions.push(qs.path,qs.name);
	else if(options.get)
		questions.push(qs.path,qs.name,qs.id);
	else{
		console.log('Please specify a function to call');
		process.exit(-1);
	}
	inquirer.registerPrompt('path', PathPrompt);
	const answers=await inquirer.prompt(questions);
	return {params:answers,options:{...options,...answers}}
}

exports.cli=async (args)=>{
	let options=parsArguments(args);
	if(options.help){

	}
	else {
		const executables=[];
		for(const key of Object.keys(options)) {
			if (options[key]){
				const params=await getParams(options);
				options=params.options;
				executables.push({method:key,...params.params});
				console.log('------------------');
				delete options[key];
			}
			else delete options[key];
		}
		for(const exe of executables){
			switch (exe.method) {
				case 'get':
					console.log(await svgSprite.get(exe.path, exe.name)); break;
				case 'remove':
					console.log(await svgSprite.remove(exe.path, exe.name, exe.id));
					break;
				default:
					console.log(await svgSprite.add(exe.path, exe.name, exe.src));
			}
		}
	}
};