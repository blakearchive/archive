import logging
import argparse
import pandas as pd
import difflib
import numpy as np


logging.basicConfig()
logger = logging.getLogger('blake_relations')

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
    
    series = []
    for index, row in df.iterrows():
        series.append((index, ','.join(row.dropna().keys())))
    pd.Series()


def mapped_relations_to_output_df(mapped_relations_df_dict, in_df):

    out_dict = {}

    for key in keys:
        out_dict.update({key: flatten_to_series(mapped_relations_df_dict[key])})
        
    df = pd.DataFrame(out_dict)
    
    df.merge(in_df, left_on='desc_id', right_on='desc_id', inplace=True)  # add id columns back on
    
    return df

    
def normalize_relations(df):
    """
    Makes all relations in blake_relations.csv file reflexive.
    
    """
    
    result = {k:None for k in keys}

    for k in keys:
        key_df = pd.DataFrame(index=df.index, columns=df.index)

        for desc_id, row in df[[k]].iterrows():
            if isinstance(desc_id, basestring):
                try:
                    desc_ids = row.str.split(',')[k]
                    if isinstance(desc_ids, list):
                        try:
                            key_df.loc[[desc_id], desc_ids] = True
                            key_df.loc[desc_ids, [desc_id]] = True  # make link in both directions, a->b and b->a
                        except KeyError as e:
                            logger.info(e)

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
                fromfile='blake_relations.csv',
                tofile='blake_relations_reconciled.csv',
            )
            for line in diff:
                logger.info(line)


def main(args):

    df = load(args.file)
    normalize_df = normalize_relations(df)

    normalize_df.to_csv(args.out_file)

    if args.diff:
        diff(args.file, args.out_file)


if __name__ == '__main__':
    
    parser = argparse.ArgumentParser()

    parser.add_argument("-d", "--diff", action="store_true", default=False)
    parser.add_argument("-o", "--out_suffix", default="reconciled")
    parser.add_argument("-f", "--file", default="blake_relations.csv")

    _args = parser.parse_args()

    (prefix, sep, suffix) = _args.file.rpartition('.')
    _args.out_file = prefix + "_" + _args.out_suffix + sep+suffix

    main(_args)
