import logging
import argparse
import pandas as pd
import difflib
import numpy as np
from tqdm import tqdm
import pdb 

logging.basicConfig()
logger = logging.getLogger('blake_relations')
logger.setLevel(0)

id_cols = ['desc_id', 'dbi', 'bad_id', 'virtual_group']

keys = ['same_matrix_ids',
'same_production_sequence_ids',
'similar_design_ids',
'reference_object_ids',
'reference_copy_ids',
'reference_work_ids',
'supplemental_ids']


def load(file_name):
    """loads file, checks for required columns"""
    
    df = pd.read_csv(file_name)
    for col in keys + id_cols:
        assert col in df, "{} not in {}".format(col, file_name)
        
    return df


def flatten_to_series(df):
    """converts dataframe into series"""
    lst = []
    for index, row in df.iterrows():
        lst.append((index,'"'+','.join(row.dropna().keys()) + '"' ))

    indexes = pd.DataFrame(lst)[0]
    mappings = pd.DataFrame(lst)[1]
    
    return pd.Series(data=mappings, index=indexes)


def mapped_relations_to_output_df(mapped_relations_df_dict, in_df):

    out_dict = {}

    for key in tqdm(keys):
        out_dict.update({key: flatten_to_series(mapped_relations_df_dict[key])})
        
    df = pd.DataFrame(out_dict) # 
    pdb.set_trace()
    
    return in_df[['dbi', 'bad_id', 'virtual_group']].merge(df[keys], left_index=True, right_index=True)  # add id columns back on


def normalize_relations(df):
    """
    Makes all relations in blake_relations.csv file reflexive.
    
    """
    
    result = {k:None for k in keys}

    for k in keys:
        # TODO : to_lower everything, normalize names

        key_df = pd.DataFrame(index=df.index, columns=df.index)

        for desc_id, row in df[[k]].iterrows():
            if isinstance(desc_id, basestring):
                try:
                    desc_ids = row.str.split(',')[k]
                    error_message=''
                    if isinstance(desc_ids, list):
                        # any relationship not inserted into the index will be dropped forever,
                        # so we need to fail and force the user to fix the input file
	# TODO : store the results of the first try block, diff against results of second
                        try:
                            key_df.loc[[desc_id], desc_ids] = True
                        except KeyError as e:
                           # logger.exception(e)
                            error_message = "error trying to associate row {} with columns {} \n".format(desc_id, desc_ids)

                        try:
                            key_df.loc[desc_ids, [desc_id]] = True  # make link in both directions, a->b and b->a
                        except KeyError as e:
                            #logger.exception(e)
                            error_message += "error trying to associate rows {} with columns {}".format(desc_ids, desc_id)

                        if error_message != '':
                            #raise Exception(error_message)
                            import warnings
                            #warnings.warn(error_message)

                except ValueError as e:
                    assert np.isnan(desc_ids) # TODO: is this right?

        result[k] = key_df

    
    return mapped_relations_to_output_df(result, df)


def diff(in_file, out_file):
    logger.info("""Executing DIFF""")
    logger.info("""--------------""")
        
    with open(in_file, 'r') as in_file:
        with open(out_file, 'r') as out_file:
            diff = difflib.unified_diff(
                in_file.readlines(),
                out_file.readlines(),
                fromfile=in_file,
                tofile=out_file,
            )
            
            for line in diff:
                logger.info(line)



def main(args):
    df = load(args.file)

    logger.info('blake_relations.csv size before drop duplicates: {}'.format(len(df)))
    logger.info('counts per desc_id: {}'.format(df.groupby('desc_id').size().sort_values(ascending=False).head(15)))
    df.drop_duplicates(subset='desc_id', keep='first', inplace=True)

    logger.info('blake_relations.csv size before after duplicates: {}'.format(len(df)))

    df.set_index('desc_id', inplace=True)

    normalize_df = normalize_relations(df)

    normalize_df.to_csv(args.out_file)

    if args.diff:
        diff(args.file, args.out_file)



if __name__ == 'main':

    parser = argparse.ArgumentParser(description='Process a blake_relations.csv file to make all mappings reciprocal')

    parser.add_argument("-d", "--diff", action="store_true", default=True)
    parser.add_argument("-o", "--out_suffix", default="reconciled")
    parser.add_argument("-f", "--file")

    _args = parser.parse_args()

    (prefix, sep, suffix) = _args.file.rpartition('.')
    _args.out_file = prefix + "_" + _args.out_suffix + sep+suffix

    main(_args)
